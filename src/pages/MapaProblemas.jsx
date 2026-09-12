import MapaDenuncia from '../components/MapaLeaflet';
import Layout from '../components/Layout';
import 'leaflet/dist/leaflet.css';

export default function MapaProblemas() {
  return (
    <Layout>
      <main className="relative h-[calc(100dvh-64px)] w-full overflow-hidden bg-[var(--color-surface-muted)] md:h-[calc(100dvh-72px)]">
        <MapaDenuncia fullScreen />
      </main>
    </Layout>
  );
}
