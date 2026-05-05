import { BriefcaseBusiness, CalendarDays, Heart, Instagram, MenuSquare, MessageCircle, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRouteSeo } from '../data/seo';
import { siteConfig } from '../data/siteConfig';
import { useSeo } from '../hooks/useSeo';

const actionItems = [
  {
    label: 'Pedir agora',
    href: siteConfig.orderLinks.direct,
    icon: Utensils,
    external: true,
  },
  {
    label: 'Reservar mesa',
    href: siteConfig.reservationPageUrl,
    icon: CalendarDays,
  },
  {
    label: 'Ver menu',
    href: siteConfig.menuPageUrl,
    icon: MenuSquare,
  },
];

const quickLinks = [
  {
    label: 'WhatsApp',
    href: siteConfig.orderLinks.whatsapp,
    icon: MessageCircle,
  },
  {
    label: 'Instagram',
    href: siteConfig.socialLinks.instagram,
    icon: Instagram,
  },
];

const HomePage = () => {
  useSeo(getRouteSeo('/'));

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#2b211b]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid w-full overflow-hidden rounded-[1.35rem] border border-[#2b211b]/10 bg-white shadow-[0_28px_90px_-62px_rgba(43,33,27,0.42)] lg:min-h-[560px] lg:grid-cols-[0.92fr_1fr]">
          <div className="relative min-h-[305px] overflow-hidden bg-[#1d1713] sm:min-h-[430px] lg:min-h-full">
            <img
              src="/burguer/hero-burguer.jpg"
              alt="Burger artesanal da casa"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.16)_48%,rgba(0,0,0,0.58)_100%)]" />
            <div className="absolute left-6 top-6 max-w-[20rem] text-white sm:left-10 sm:top-10">
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em]">Cuiabar | Campinas</p>
              <h1 className="mt-4 font-heading text-[2.15rem] leading-[0.98] sm:text-[2.45rem]">
                O sabor que você escolhe.
              </h1>
              <p className="mt-4 max-w-[15rem] text-lg leading-snug text-white/88">
                Direto e simples.
              </p>
            </div>
          </div>

          <div className="flex min-h-[430px] flex-col justify-between px-6 py-7 sm:px-10 sm:py-10 lg:px-12">
            <div className="flex flex-1 items-center">
              <div className="w-full space-y-4">
                <div className="grid w-full gap-3 sm:grid-cols-3">
                  {actionItems.map((item) => {
                    const Icon = item.icon;
                    const className =
                      'group flex min-h-[96px] flex-col items-center justify-center rounded-lg border border-[#8f3518]/55 bg-white text-center text-[#8f3518] transition hover:-translate-y-0.5 hover:border-[#8f3518] hover:shadow-[0_18px_42px_-32px_rgba(143,53,24,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f3518] sm:min-h-[120px]';
                    const content = (
                      <>
                        <span className="flex h-11 w-11 items-center justify-center sm:h-14 sm:w-14">
                          <Icon aria-hidden="true" className="h-7 w-7 stroke-[1.55] sm:h-8 sm:w-8" />
                        </span>
                        <span className="mt-3 w-full border-t border-[#8f3518]/35 bg-[#8f3518] px-2 py-3 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-white">
                          {item.label}
                        </span>
                      </>
                    );

                    return item.external ? (
                      <a key={item.label} href={item.href} className={className}>
                        {content}
                      </a>
                    ) : (
                      <Link key={item.label} to={item.href} className={className}>
                        {content}
                      </Link>
                    );
                  })}
                </div>

                <Link
                  to={siteConfig.reservationPageUrl}
                  className="flex items-start gap-3 rounded-lg border border-[#8f3518]/18 bg-[#fbf6ef] px-4 py-3 text-[#2b211b] transition hover:border-[#8f3518]/45 hover:bg-[#fffaf3]"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#8f3518]">
                    <Heart aria-hidden="true" className="h-4.5 w-4.5" />
                  </span>
                  <span>
                    <span className="block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#8f3518]">
                      Dia das Mães · 10/05, domingo
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-[#5f554d]">
                      Esperamos vocês no Cuiabar para aproveitar o melhor em família.
                    </span>
                  </span>
                </Link>
              </div>
            </div>

            <footer className="mt-8 flex flex-col gap-4 border-t border-[#2b211b]/10 pt-5 text-[0.74rem] text-[#5f554d] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {quickLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      aria-label={item.label}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2b211b]/12 text-[#2b211b] transition hover:border-[#8f3518] hover:text-[#8f3518]"
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
                <span>Jardim Aurélia · Campinas/SP</span>
                <Link to="/vagas" className="inline-flex items-center gap-1.5 font-medium text-[#2b211b] transition hover:text-[#8f3518]">
                  <BriefcaseBusiness aria-hidden="true" className="h-3.5 w-3.5" />
                  Trabalhe conosco.
                </Link>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
