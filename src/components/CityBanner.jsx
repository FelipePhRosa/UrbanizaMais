import { BadgeCheck, Info, Landmark, Users } from 'lucide-react';
import { CITIES } from './news/cities';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance([r, g, b]) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastWithWhite(rgb) {
  return 1.05 / (relativeLuminance(rgb) + 0.05);
}

function ensureContrast(hex, target = 4.5) {
  let rgb = hexToRgb(hex);
  let guard = 0;
  while (contrastWithWhite(rgb) < target && guard < 40) {
    rgb = rgb.map((c) => Math.round(c * 0.92));
    guard += 1;
  }
  return '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('');
}

export default function CityBanner({ cityId, city, coatArmsUrl, className = '' }) {
  const preset = city ?? CITIES[cityId];
  if (!preset) return null;

  const coatOfArms = coatArmsUrl !== undefined ? coatArmsUrl : preset.coatArmsUrl ?? preset.coat_arms_url ?? preset.coatOfArms;
  const { name, state = '' } = preset;
  const color = ensureContrast(preset.color || '#1E7E46');

  return (
    <section
      aria-label={`Banner oficial da Prefeitura Municipal de ${name}`}
      className={`city-banner ${className}`}
    >
      <div className="city-banner__layout">
        <div className="city-banner__identity" style={{ backgroundColor: color }}>
          {coatOfArms && <img
            src={coatOfArms}
            alt={`Brasão de ${name}`}
            className="city-banner__thumbnail"
          />}

          <div className="city-banner__title">
            <p className="city-banner__eyebrow">Prefeitura Municipal</p>
            <h2>
              <span>{name}</span>
              <BadgeCheck
                className="city-banner__verified"
                aria-label="Ambiente verificado pela plataforma"
              />
            </h2>
            <p className="city-banner__state">{state}</p>
          </div>


          <div className="city-banner__crest-zone" aria-hidden="true">
            {coatOfArms && <img
              alt=""
              src={coatOfArms}
              className="city-banner__watermark"
            />}
          </div>
        </div>

        <aside className="city-banner__details dark:bg-[var(--color-surface)] border border-[var(--color-border)]" aria-label={`Informações da Prefeitura de ${name}`}>
          <div className="city-banner__detail">
            <Users aria-hidden="true" />
            <div>
              <strong className='text-sm'>Gestão municipal</strong>
              <span className='font-medium text-[10px]'>Prefeitura de {name}</span>
            </div>
          </div>
          <div className="city-banner__detail">
            <Info aria-hidden="true" />
            <div>
              <strong className='text-sm'>Identidade da prefeitura</strong>
              <span className='font-medium text-[10px]'>Cuidando de pessoas, construindo uma cidade melhor.</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}