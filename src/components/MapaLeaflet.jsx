import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ChevronRight, List, LocateFixed, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MiniModal from './MiniModal';
import ReportModal from './ReportModal';

// O evento 'storage' não dispara na mesma aba; avisamos nós mesmos quando 'darkMode' é gravado
if (typeof window !== 'undefined' && !window.__darkModePatched) {
  window.__darkModePatched = true;
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function setItem(key, value) {
    originalSetItem.call(this, key, value);
    if (key === 'darkMode') window.dispatchEvent(new Event('darkModeChange'));
  };
}

const CITIES = [
  { name: 'Pelotas', lat: -31.765, lng: -52.337 },
  { name: 'Camaquã', lat: -30.848781374172674, lng: -51.80721534205658 },
  { name: 'Arambaré', lat: -30.910520592030185, lng: -51.50006366984258 },
  { name: 'Cristal', lat: -31.00056536172436, lng: -52.047261177199886 },
];

const STATUS_MARKER_COLORS = {
  pendente: 'var(--color-warning)',
  aprovado: 'var(--color-primary)',
  resolvido: 'var(--color-success)',
  resolvida: 'var(--color-success)',
  rejeitado: 'var(--color-danger)',
};

function getStatusColor(status) {
  const normalizedStatus = String(status || '').toLowerCase();
  if (normalizedStatus.includes('pend') || normalizedStatus.includes('andamento')) return STATUS_MARKER_COLORS.pendente;
  if (normalizedStatus.includes('resolv') || normalizedStatus.includes('conclu')) return STATUS_MARKER_COLORS.resolvido;
  if (normalizedStatus.includes('rejeit')) return STATUS_MARKER_COLORS.rejeitado;
  return STATUS_MARKER_COLORS[normalizedStatus] || STATUS_MARKER_COLORS.aprovado;
}

function getNearbyReportCount(report, reports) {
  const latitude = Number(report.latitude);
  const longitude = Number(report.longitude);

  return reports.filter((candidate) => {
    const candidateLatitude = Number(candidate.latitude);
    const candidateLongitude = Number(candidate.longitude);

    return Number.isFinite(candidateLatitude) && Number.isFinite(candidateLongitude)
      && Math.abs(candidateLatitude - latitude) < 0.002
      && Math.abs(candidateLongitude - longitude) < 0.002;
  }).length;
}

function createReportMarker(report, nearbyCount) {
  const markerColor = getStatusColor(report.status || report.reportStatus);
  const countLabel = nearbyCount > 1 ? `<strong>${nearbyCount}</strong>` : '';

  return L.divIcon({
    className: 'urban-report-marker',
    html: `<span style="--marker-color: ${markerColor}"><i></i>${countLabel}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function UserLocation() {
  const map = useMap();
  const userMarkerRef = useRef(null);
  const lastPositionRef = useRef(null);
  const buttonRef = useRef(null);
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  useEffect(() => {
    if (buttonRef.current) L.DomEvent.disableClickPropagation(buttonRef.current);
    if (!navigator.geolocation) return;

    const userIcon = L.divIcon({
      className: '',
      html: '<div style="width:20px;height:20px;background:#ff0000;border:2px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latlng = [latitude, longitude];
        const isFirstFix = !lastPositionRef.current;
        lastPositionRef.current = latlng;

        if (!userMarkerRef.current) {
          userMarkerRef.current = L.marker(latlng, { icon: userIcon }).addTo(map);
        } else {
          userMarkerRef.current.setLatLng(latlng);
        }

        if (isFirstFix) map.setView(latlng, map.getZoom());
      },
      () => console.error('Erro ao obter localização'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map]);

  function goToUser() {
    const fly = (latlng) => map.flyTo(latlng, Math.max(map.getZoom(), 16));
    if (lastPositionRef.current) return fly(lastPositionRef.current);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => fly([coords.latitude, coords.longitude]),
      () => alert('Não foi possível obter sua localização. Verifique a permissão do navegador.'),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }

  if (!supported) return null;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={goToUser}
      title="Voltar para minha localização"
      aria-label="Voltar para minha localização"
      className="absolute right-4 top-16 z-[1000] flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-md"
    >
      <LocateFixed size={18} />
    </button>
  );
}

function CenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], 15);
  }, [center, map]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (event) => onMapClick(event.latlng.lat, event.latlng.lng) });
  return null;
}

function ReportCarousel({ reports, activeReport, onChange, onPauseChange }) {
  const navigate = useNavigate();
  const report = reports[activeReport];

  if (!report) return null;

  return (
    <div
      className="absolute bottom-4 left-1/2 z-[1000] w-[calc(100%-1.5rem)] max-w-[520px] -translate-x-1/2 sm:bottom-6"
      onMouseEnter={() => onPauseChange(true)}
      onMouseLeave={() => onPauseChange(false)}
      onTouchStart={() => onPauseChange(true)}
      onTouchEnd={() => onPauseChange(false)}
      onTouchCancel={() => onPauseChange(false)}
    >
      <button
        type="button"
        onClick={() => navigate(`/report/${report.id}`)}
        className="urban-map-card w-full text-left"
        aria-label={`Abrir relato ${report.reportTitle || 'da comunidade'}`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="urban-map-card__eyebrow">Relato próximo</span>
          <span className="urban-map-card__counter">{activeReport + 1} / {reports.length}</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="urban-map-card__icon" aria-hidden="true"><MapPin size={18} /></span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-sm sm:text-base">
              {report.reportTitle || 'Relato da comunidade'}
            </strong>
            <span className="mt-1 block truncate text-xs text-[var(--color-muted)]">
              {report.address || 'Ver detalhes do registro'}
            </span>
          </span>
          <ChevronRight className="shrink-0 text-[var(--color-primary)]" size={19} />
        </div>
      </button>

      <div className="mt-2 flex justify-center gap-1.5" aria-label="Relatos em destaque">
        {reports.slice(0, 6).map((item, index) => (
          <button
            type="button"
            key={item.id || index}
            aria-label={`Mostrar relato ${index + 1}`}
            aria-current={index === activeReport}
            onClick={() => onChange(index)}
            className={`h-1.5 rounded-full transition-all ${index === activeReport ? 'w-6 bg-[var(--color-primary)]' : 'w-1.5 bg-[var(--color-surface)]/80'}`}
          />
        ))}
      </div>

      <button type="button" onClick={() => navigate('/Report')} className="urban-map-list-button mx-auto mt-3">
        <List size={15} />
        Voltar para lista
      </button>
    </div>
  );
}

function CityPicker({ cities, selectedCity, isOpen, onToggle, onSelect }) {
  return (
    <div className="absolute right-4 top-4 z-[1000]">
      <button type="button" onClick={onToggle} className="urban-map-picker">
        <span>{selectedCity}</span>
        <ChevronRight size={15} className={isOpen ? 'rotate-90' : 'rotate-0'} />
      </button>

      {isOpen && (
        <div className="urban-map-picker__menu" role="menu">
          {cities.filter((city) => city.name !== selectedCity).map((city) => (
            <button type="button" key={city.name} onClick={() => onSelect(city)} className="urban-map-picker__item" role="menuitem">
              {city.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MapaDenuncia({ fullScreen = false, reports: suppliedReports, showCityPicker = true, interactive = true }) {
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem('darkMode')) || false);
  const [modalOpen, setModalOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [reports, setReports] = useState([]);
  const [center, setCenter] = useState(null);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Pelotas');
  const [activeReport, setActiveReport] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    const readDarkMode = () => {
      try {
        setDarkMode(!!JSON.parse(localStorage.getItem('darkMode')));
      } catch {
        setDarkMode(false);
      }
    };
    readDarkMode();

    window.addEventListener('darkModeChange', readDarkMode);
    window.addEventListener('storage', readDarkMode);
    return () => {
      window.removeEventListener('darkModeChange', readDarkMode);
      window.removeEventListener('storage', readDarkMode);
    };
  }, []);

  useEffect(() => {
    if (!fullScreen || reports.length < 2 || isCarouselPaused) return undefined;

    const timer = setInterval(() => {
      setActiveReport((current) => (current + 1) % reports.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [fullScreen, reports.length, isCarouselPaused]);

  useEffect(() => {
    if (activeReport >= reports.length && reports.length > 0) setActiveReport(0);
  }, [activeReport, reports.length]);

  useEffect(() => {
    if (Array.isArray(suppliedReports)) {
      setReports(suppliedReports);
      const reportWithLocation = suppliedReports.find((report) => Number.isFinite(Number.parseFloat(report.latitude)) && Number.isFinite(Number.parseFloat(report.longitude)));
      if (reportWithLocation) setCenter({ lat: Number.parseFloat(reportWithLocation.latitude), lng: Number.parseFloat(reportWithLocation.longitude) });
      return undefined;
    }

    const fetchReports = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/reportList`);
        const data = await res.json();
        setReports(Array.isArray(data) ? data : data.data || []);
      } catch {
        console.error('Erro ao buscar reports');
      }
    };

    fetchReports();
  }, [suppliedReports]);

  function handleMapClick(lat, lng) {
    setCoords({ lat, lng });
    setModalOpen(true);
  }

  function selectCity(city) {
    setSelectedCity(city.name);
    setCenter({ lat: city.lat, lng: city.lng });
    setCityDropdownOpen(false);
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[var(--color-surface-muted)] ${darkMode ? '[&_.leaflet-tile-pane]:[filter:invert(1)_hue-rotate(180deg)_brightness(0.9)_contrast(0.9)]' : ''}`}>
      <MapContainer center={[-31.769, -52.341]} zoom={15} className="urban-map h-full w-full" scrollWheelZoom zoomControl>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {interactive && <UserLocation />}

        {reports.map((report, index) => {
          const lat = Number.parseFloat(report.latitude);
          const lng = Number.parseFloat(report.longitude);
          if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

          return (
            <Marker key={report.id || index} position={[lat, lng]} icon={createReportMarker(report, getNearbyReportCount(report, reports))}>
              <Popup closeButton={false} className="bg-transparent p-0 shadow-none">
                <MiniModal report={report} id={report.id} />
              </Popup>
            </Marker>
          );
        })}

        {interactive && <MapClickHandler onMapClick={handleMapClick} />}
        <CenterMap center={center} />
      </MapContainer>

      {showCityPicker && <CityPicker cities={CITIES} selectedCity={selectedCity} isOpen={cityDropdownOpen} onToggle={() => setCityDropdownOpen((open) => !open)} onSelect={selectCity} />}

      {fullScreen && reports.length > 0 && <ReportCarousel reports={reports} activeReport={activeReport} onChange={setActiveReport} onPauseChange={setIsCarouselPaused} />}

      {interactive && <ReportModal isOpen={modalOpen} onClose={() => setModalOpen(false)} lat={coords?.lat ?? null} lng={coords?.lng ?? null} />}
    </div>
  );
}

export default MapaDenuncia;
