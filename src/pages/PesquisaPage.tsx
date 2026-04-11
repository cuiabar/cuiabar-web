import { useEffect, useState } from 'react';
import { Reveal } from '../components/Reveal';
import { getRouteSeo } from '../data/seo';
import { useSeo } from '../hooks/useSeo';

declare global {
  interface Window {
    google?: {
      search?: {
        cse?: {
          element?: {
            render: (options: Record<string, unknown>) => void;
            getElement: (name: string) => unknown;
          };
        };
      };
    };
    __gcse?: Record<string, unknown>;
  }
}

const CSE_ID = '04295c6bbf47e4f65';
const SCRIPT_ID = 'google-cse-script';
const CONTAINER_ID = 'google-cse-search-root';
const ELEMENT_NAME = 'cuiabar-google-search';

const renderSearch = () => {
  const api = window.google?.search?.cse?.element;
  const container = document.getElementById(CONTAINER_ID);

  if (!api || !container || container.childElementCount > 0) {
    return;
  }

  api.render({
    div: CONTAINER_ID,
    tag: 'search',
    gname: ELEMENT_NAME,
  });
};

const PesquisaPage = () => {
  const [ready, setReady] = useState(false);

  useSeo(getRouteSeo('/pesquisa'));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    window.__gcse = { parsetags: 'explicit' };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (window.google?.search?.cse?.element) {
      renderSearch();
      setReady(true);
      return undefined;
    }

    const script = existingScript ?? document.createElement('script');

    if (!existingScript) {
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://cse.google.com/cse.js?cx=${CSE_ID}`;
      document.body.appendChild(script);
    }

    const handleLoad = () => {
      renderSearch();
      setReady(true);
    };

    script.addEventListener('load', handleLoad);

    return () => {
      script.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <section className="container-shell space-y-8 py-14">
      <Reveal as="header" className="card p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">Pesquisa Google</p>
        <h1 className="mt-3 font-heading text-4xl text-cocoa sm:text-5xl">Busque conteúdos e páginas do Cuiabar</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-steel">
          Use a pesquisa para encontrar páginas do restaurante, menu, Burguer Cuiabar, ProRefeição, vagas, reservas e outros conteúdos
          indexados pelo Google.
        </p>
      </Reveal>

      <Reveal delay={100} className="card p-6 sm:p-8">
        <div className="rounded-[2rem] border border-sand/50 bg-white/80 p-4 shadow-soft sm:p-6">
          <div id={CONTAINER_ID} />
          {!ready ? (
            <div className="rounded-[1.5rem] bg-cream/80 px-5 py-6 text-sm text-steel">
              Carregando mecanismo de pesquisa do Google...
            </div>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
};

export default PesquisaPage;
