import { OperatingStatus } from '../components/OperatingStatus';
import { getRouteSeo } from '../data/seo';
import { useSeo } from '../hooks/useSeo';
import { AgendaPreviewSection } from '../sections/AgendaPreviewSection';
import { DifferentialsSection } from '../sections/DifferentialsSection';
import { HeroSection } from '../sections/HeroSection';
import { LocalSignalsSection } from '../sections/LocalSignalsSection';
import { MenuHighlightsSection } from '../sections/MenuHighlightsSection';
import { ProRefeicaoSection } from '../sections/ProRefeicaoSection';
import { TestimonialsSection } from '../sections/TestimonialsSection';

const HomePage = () => {
  useSeo(getRouteSeo('/'));

  return (
    <>
      <HeroSection />

      <section className="container-shell -mt-6 pb-8">
        <OperatingStatus />
      </section>

      <DifferentialsSection />

      <div id="nossos-cortes" className="scroll-mt-28">
        <MenuHighlightsSection />
      </div>

      <AgendaPreviewSection />
      <TestimonialsSection />
      <ProRefeicaoSection />
      <LocalSignalsSection />
    </>
  );
};

export default HomePage;
