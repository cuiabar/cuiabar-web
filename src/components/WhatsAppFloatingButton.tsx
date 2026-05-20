import { siteConfig } from '../data/siteConfig';

const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;

type WhatsAppFloatingButtonProps = {
  hide?: boolean;
};

export const WhatsAppFloatingButton = ({ hide = false }: WhatsAppFloatingButtonProps) => {
  if (hide) {
    return null;
  }

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com o Villa Cuiabar pelo WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-4 py-3 text-sm font-bold text-white shadow-[0_18px_48px_-22px_rgba(37,211,102,0.75)] transition hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:outline-white md:bottom-6 md:right-6 md:px-5"
    >
      <span aria-hidden="true" className="text-xl leading-none">💬</span>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
};
