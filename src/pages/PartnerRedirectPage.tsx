import { useEffect } from 'react';

const buildTarget = (partner: 'ifood' | '99food') => {
  const url = new URL(`https://crm.cuiabar.com/go/${partner}`);

  if (typeof window !== 'undefined') {
    const current = new URL(window.location.href);
    current.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    url.searchParams.set('origin_url', current.toString());
    url.searchParams.set('ref_page', current.pathname);
  }

  return url.toString();
};

export const PartnerRedirectPage = ({ partner }: { partner: 'ifood' | '99food' }) => {
  useEffect(() => {
    window.location.replace(buildTarget(partner));
  }, [partner]);

  return (
    <section className="container-shell py-20">
      <div className="card max-w-2xl p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">Redirecionando</p>
        <h1 className="mt-3 font-heading text-4xl text-cocoa">{partner === 'ifood' ? 'Abrindo iFood' : 'Abrindo 99Food'}</h1>
        <p className="mt-4 text-base text-steel">
          Estamos registrando o clique e enviando voce para o canal de pedido. Se a pagina nao abrir sozinha, atualize o navegador.
        </p>
      </div>
    </section>
  );
};
