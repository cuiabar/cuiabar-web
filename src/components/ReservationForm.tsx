import { siteConfig } from '../data/siteConfig';

export const ReservationForm = () => {
  const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;

  return (
    <section className="card space-y-4 p-6 sm:p-8">
      <h3 className="font-heading text-2xl text-cocoa">Reservas via WhatsApp</h3>
      <p className="text-steel">
        O Villa Cuiabar atende reservas, mesas para grupos e dúvidas diretamente pelo WhatsApp.
      </p>
      <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-primary inline-flex">
        Abrir WhatsApp
      </a>
    </section>
  );
};
