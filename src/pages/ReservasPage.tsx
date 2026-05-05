import { Reveal } from '../components/Reveal';
import { reservationFaqs } from '../data/content';
import { getRouteSeo } from '../data/seo';
import { siteConfig } from '../data/siteConfig';
import { useSeo } from '../hooks/useSeo';
import '../styles/reservations.css';

const ReservasPage = () => {
  const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent('Ola! Quero fazer uma reserva no Cuiabar.')}`;

  useSeo(getRouteSeo('/reservas'));

  return (
    <section className="container-shell space-y-10 py-14">
      <Reveal as="header" className="card p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-terracotta">Reservas Cuiabar</p>
        <h1 className="mt-3 font-heading text-5xl">Reservas no Villa Cuiabar</h1>
        <p className="mt-3 max-w-3xl text-steel">
          O sistema automatico de reservas esta temporariamente indisponivel. Para consultar mesa, horario ou grupo, fale direto com a equipe pelo WhatsApp da loja.
        </p>
        <div className="mt-8">
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="reservation-cta">
            <span className="reservation-cta__glow" aria-hidden="true" />
            <span className="reservation-cta__border" aria-hidden="true" />
            <span className="reservation-cta__content">
              <span className="reservation-cta__eyebrow">Atendimento da loja</span>
              <span className="reservation-cta__label">Chamar no WhatsApp</span>
              <span className="reservation-cta__hint">{siteConfig.phone}</span>
            </span>
          </a>
          <p className="mt-4 text-sm text-steel">A equipe confirma disponibilidade e orienta os proximos passos pelo atendimento oficial.</p>
        </div>
      </Reveal>
      <Reveal as="section" delay={80} className="grid gap-8 lg:grid-cols-2">
        <div className="card p-8">
          <h2 className="font-heading text-3xl">Servico indisponivel</h2>
          <p className="mt-3 text-steel">
            O fluxo online de reservas foi pausado para evitar confirmacoes automaticas fora da operacao atual.
            Enquanto isso, toda solicitacao deve passar pelo WhatsApp da loja.
          </p>
          <div className="mt-6 rounded-xl border border-sand/50 bg-white p-4">
            <p className="text-sm font-semibold text-cocoa">Politica de tolerancia</p>
            <p className="mt-2 text-sm text-steel">
              Reservas possuem tolerancia de 10 minutos. Para grupos acima de 10 pessoas, nao ha tolerancia. Apos o horario combinado, a mesa podera ser
              desmontada e liberada por ordem de chegada.
            </p>
          </div>
          <p className="mt-5 text-sm text-steel">
            A pagina atende quem busca reserva de restaurante no Jardim Aurelia e no eixo da John Boyd Dunlop, com uma entrada unica para mesas, aniversarios e grupos.
          </p>
        </div>
        <div className="card p-8">
          <h2 className="font-heading text-3xl">Como pedir atendimento</h2>
          <div className="mt-5 space-y-4 text-steel">
            <p>
              Chame no WhatsApp, informe a data desejada, horario, quantidade de pessoas e qualquer observacao importante.
            </p>
            <p>
              A equipe responde diretamente no atendimento da loja e confirma o que estiver disponivel para o dia.
            </p>
            <p className="rounded-xl border border-sand/50 bg-white px-4 py-3 text-sm">
              WhatsApp oficial: <strong>{siteConfig.phone}</strong>
            </p>
          </div>
        </div>
      </Reveal>
      <Reveal delay={110} className="card p-8">
        <h2 className="font-heading text-3xl">Perguntas frequentes</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {reservationFaqs.map((faq) => (
            <article key={faq.question} className="rounded-xl border border-sand/50 bg-white p-4">
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="mt-1 text-sm text-steel">{faq.answer}</p>
            </article>
          ))}
        </div>
      </Reveal>
      <Reveal delay={120} className="card p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">Atendimento direto</p>
        <h2 className="mt-3 font-heading text-4xl">Chame a loja no WhatsApp</h2>
        <p className="mt-3 text-steel">Nossa equipe verifica a disponibilidade e responde pelo canal oficial.</p>
        <div className="mt-8 flex justify-center">
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="reservation-cta reservation-cta--compact">
            <span className="reservation-cta__glow" aria-hidden="true" />
            <span className="reservation-cta__border" aria-hidden="true" />
            <span className="reservation-cta__content">
              <span className="reservation-cta__label">Chamar no WhatsApp</span>
              <span className="reservation-cta__hint">{siteConfig.phone}</span>
            </span>
          </a>
        </div>
      </Reveal>
    </section>
  );
};

export default ReservasPage;
