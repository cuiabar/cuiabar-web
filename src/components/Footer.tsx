import { navItems, siteConfig } from '../data/siteConfig';
import { OperatingStatus } from './OperatingStatus';

const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;

type FooterProps = {
  hideWhatsAppActions?: boolean;
};

export const Footer = ({ hideWhatsAppActions = false }: FooterProps) => {
  const visibleNavItems = hideWhatsAppActions ? navItems.filter((item) => !item.label.toLowerCase().includes('whatsapp') && !item.to.includes('wa.me')) : navItems;

  return (
  <footer className="mt-20 bg-cocoa py-12 text-white">
    <div className="container-shell grid gap-8 md:grid-cols-4">
      <div>
        <div className="flex items-center gap-3">
          <img src={siteConfig.logoUrl} alt="" width="48" height="48" decoding="async" className="h-12 w-12 rounded-full object-cover transition duration-500 hover:rotate-6 hover:scale-105" />
          <h3 className="font-heading text-2xl">{siteConfig.brandShortName}</h3>
        </div>
        <p className="mt-3 text-sm text-white/80">
          Restaurante brasileiro em Campinas com costela, fraldinha, linguiça cuiabana, bar completo e agenda de música ao vivo.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
          <span className="rounded-full border border-white/20 px-3 py-1 text-white/85">Espaço kids</span>
          <span className="rounded-full border border-white/20 px-3 py-1 text-white/85">Música sex-dom</span>
        </div>
      </div>
      <nav aria-label="Links rápidos do rodapé">
        <h4 className="font-semibold">Links rápidos</h4>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          {visibleNavItems.map((item) => (
            <li key={item.to}>
              <a
                href={item.to}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                aria-label={item.external ? `${item.label} - abre em nova aba` : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <h4 className="font-semibold">Contato</h4>
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          <li>{siteConfig.phone}</li>
          <li>{siteConfig.email}</li>
          <li>Atendimento em Campinas/SP</li>
          <li>
            <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Abrir Instagram do Villa Cuiabar em nova aba">
              Instagram
            </a>
          </li>
          <li>
            <a href={siteConfig.socialLinks.facebook} target="_blank" rel="noreferrer" aria-label="Abrir Facebook do Villa Cuiabar em nova aba">
              Facebook
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold">Horários</h4>
        <OperatingStatus className="mt-3 text-cocoa" />
        <ul className="mt-3 space-y-2 text-sm text-white/80">
          {siteConfig.openingHours.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="mt-3 text-sm text-white/75">
          Programação musical no fim de semana, comida brasileira e atendimento pelo WhatsApp oficial.
        </p>
        {!hideWhatsAppActions ? (
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-terracotta px-4 py-2 text-sm font-semibold" aria-label="Falar com o Villa Cuiabar pelo WhatsApp">
            Falar no WhatsApp
          </a>
        ) : null}
      </div>
    </div>
    <div className="container-shell mt-8 border-t border-white/20 pt-4 text-xs text-white/70">
      © {new Date().getFullYear()} {siteConfig.brandName}. Todos os direitos reservados.
    </div>
  </footer>
  );
};
