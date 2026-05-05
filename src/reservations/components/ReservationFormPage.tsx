import { AlertCircle, Clock, MessageCircle } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { useSeo } from '../../hooks/useSeo';
import { decorateOutboundUrl, trackContact, trackEvent } from '../../lib/analytics';
import { RESERVATION_ANALYTICS_CONTENT_NAME } from '../constants';

const reservationWhatsappMessage = 'Ola! Quero fazer uma reserva no Cuiabar.';

export const ReservationFormPage = () => {
  const whatsappHref = decorateOutboundUrl(
    `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(reservationWhatsappMessage)}`,
    {
      content_name: RESERVATION_ANALYTICS_CONTENT_NAME,
      destination: 'whatsapp',
      reservation_stage: 'unavailable',
    },
  );

  useSeo({
    title: 'Reservas Cuiabar | Atendimento pelo WhatsApp',
    description: 'O sistema automatico de reservas do Cuiabar esta indisponivel no momento. Chame a loja pelo WhatsApp para falar com a equipe.',
    ogTitle: 'Reservas Cuiabar pelo WhatsApp',
    ogDescription: 'Fale com a equipe do Cuiabar pelo WhatsApp para consultar disponibilidade de mesa.',
    canonicalUrl: `${siteConfig.reservationPortalUrl}/`,
    keywords: ['reserva Cuiabar WhatsApp', 'reservas Cuiabar', 'restaurante Campinas reserva'],
  });

  const handleWhatsappClick = () => {
    const eventParams = {
      content_name: RESERVATION_ANALYTICS_CONTENT_NAME,
      content_category: 'reservation',
      reservation_stage: 'unavailable',
      destination: 'whatsapp',
    };

    trackEvent('reservation_whatsapp_click', eventParams);
    trackContact('whatsapp', eventParams);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full overflow-hidden rounded-[2.2rem] border border-cocoa/10 bg-white/94 shadow-[0_38px_110px_-62px_rgba(51,35,19,0.55)]">
        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="bg-[linear-gradient(145deg,rgba(51,35,19,0.98),rgba(111,61,38,0.96))] p-7 text-white sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/16 bg-white/10">
              <AlertCircle className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mt-8 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#f0d2bf]">Reservas Cuiabar</p>
            <h1 className="mt-3 font-heading text-5xl leading-[0.94] sm:text-6xl">Servico indisponivel.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/82">
              O sistema automatico de reservas esta temporariamente pausado. Para consultar mesa, horario ou grupo, fale direto com a loja pelo WhatsApp.
            </p>
          </div>

          <div className="p-7 sm:p-10">
            <div className="rounded-[1.6rem] border border-terracotta/20 bg-[#fff8f1] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-terracotta shadow-[0_16px_36px_-28px_rgba(51,35,19,0.72)]">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-heading text-3xl text-cocoa">Chame no WhatsApp</h2>
                  <p className="mt-2 text-sm leading-6 text-steel">
                    Nossa equipe confirma disponibilidade, orienta sobre horarios e organiza sua reserva pelo atendimento da loja.
                  </p>
                </div>
              </div>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-terracotta px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:translate-y-[-1px] hover:bg-cocoa sm:w-auto"
              onClick={handleWhatsappClick}
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Chamar no WhatsApp
            </a>

            <p className="mt-4 text-sm text-steel">
              Telefone da loja: <strong className="text-cocoa">{siteConfig.phone}</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
