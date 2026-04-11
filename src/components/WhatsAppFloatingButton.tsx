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
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-terracotta text-2xl text-white shadow-soft transition hover:scale-105 md:hidden"
    >
      💬
    </a>
  );
};
