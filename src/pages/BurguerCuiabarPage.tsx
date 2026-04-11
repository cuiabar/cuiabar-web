import { getRouteSeo } from '../data/seo';
import { siteConfig } from '../data/siteConfig';
import { useSeo } from '../hooks/useSeo';

type BurguerCuiabarPageProps = {
  seoPath?: '/burguer' | '/burger-site';
  domainMode?: 'site' | 'subdomain';
};

type BurgerItem = {
  name: string;
  description: string;
  image: string;
  note?: string;
};

const burgers: BurgerItem[] = [
  {
    name: 'O Insano',
    description: 'Duplo chicken crispy com molho honey mustard e presença marcante já na primeira mordida.',
    image: '/burguer/o-insano.webp',
    note: 'Duplo crispy com mostarda',
  },
  {
    name: 'O Colosso',
    description: 'Duplo costela com cheddar em uma montagem mais intensa, feita para quem quer um burger maior.',
    image: '/burguer/o-colosso.webp',
    note: 'Duplo costela & cheddar',
  },
  {
    name: 'O Crocante',
    description: 'Crocância na medida, salada fresca e queijo derretido em uma leitura mais clássica.',
    image: '/burguer/o-crocante.webp',
  },
  {
    name: 'O Parrudo',
    description: 'Burger robusto com bacon, cheddar e presença forte no prato, do jeito que chama atenção na mesa.',
    image: '/burguer/o-parrudo.webp',
  },
  {
    name: 'O Brabo',
    description: 'Montagem carregada, com bacon, presunto e queijo para quem procura um lanche mais pesado.',
    image: '/burguer/o-brabo.webp',
  },
  {
    name: 'O Raiz',
    description: 'Leitura direta do burger clássico da casa, com salada fresca e montagem para pedir sem erro.',
    image: '/burguer/o-raiz.webp',
  },
  {
    name: 'O Cuiabar',
    description: 'Burger da casa com identidade própria, salada fresca e perfil mais equilibrado.',
    image: '/burguer/o-cuiabar.webp',
  },
];

const highlights = [
  {
    icon: '🔥',
    title: 'Na chapa',
    text: 'Montagem feita na hora, com foco em lanche quente, visual forte e boa leitura no delivery.',
  },
  {
    icon: '🛵',
    title: 'Pedido simples',
    text: 'Acesso direto ao iFood e ao 99Food, sem rodeio e sem canal perdido no meio do caminho.',
  },
  {
    icon: '🍔',
    title: 'Linha própria',
    text: 'O Burger Cuiabar tem presença separada para ganhar força na busca, no delivery e na marca.',
  },
  {
    icon: '🌙',
    title: 'Operação da noite',
    text: 'Disponível de quarta a sábado, a partir das 18h, dentro da frente Burger Cuiabar.',
  },
];

const navLinkClass =
  'text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#6c584c] transition hover:text-[#ea6a2a]';

const buttonBaseClass =
  'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition';

const primaryButtonClass = `${buttonBaseClass} bg-[#ea6a2a] text-white shadow-[0_22px_46px_-28px_rgba(234,106,42,0.84)] hover:-translate-y-1 hover:bg-[#d95f23]`;
const secondaryButtonClass = `${buttonBaseClass} border border-[#d8d1ca] bg-white text-[#311710] hover:-translate-y-1 hover:border-[#ea6a2a]`;

const BurguerCuiabarPage = ({ seoPath = '/burguer' }: BurguerCuiabarPageProps) => {
  const seo = getRouteSeo(seoPath);
  useSeo(seo);

  return (
    <main className="page-transition overflow-hidden bg-[#f6f0e8] pb-12 text-[#311710]">
      <section className="relative overflow-hidden bg-[#f6f0e8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(243,198,66,0.18),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(234,106,42,0.12),transparent_24%)]" />

        <div className="relative container-shell pt-6 sm:pt-8">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#fff2da]">
                <img src={siteConfig.burguerLogoUrl} alt="Logo do Burger Cuiabar" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[#ea6a2a]">Burger Cuiabar</p>
                <p className="font-heading text-lg leading-none text-[#311710]">burger.cuiabar.com</p>
              </div>
            </div>

            <nav className="hidden items-center gap-5 sm:flex">
              <a href="#cardapio" className={navLinkClass}>
                Cardápio
              </a>
              <a href="#destaques" className={navLinkClass}>
                Destaques
              </a>
              <a href="#pedir" className={navLinkClass}>
                Onde pedir
              </a>
              <a href={siteConfig.burguerOrderLinks.ifood} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-[#ea6a2a] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#d95f23]">
                Pedir agora
              </a>
            </nav>
          </header>

          <div className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-[#e8d7c7] bg-white/88 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#6b5648] shadow-[0_18px_40px_-30px_rgba(49,23,16,0.2)]">
            <span className="text-[#ea6a2a]">●</span>
            Pedido oficial Burger Cuiabar
            <span className="text-[#311710]">burger.cuiabar.com</span>
          </div>

          <div className="grid items-center gap-10 pb-14 pt-10 lg:grid-cols-[0.84fr_1.16fr] lg:gap-14 lg:pb-20 lg:pt-14">
            <div className="relative z-10 max-w-[34rem]">
              <span className="inline-flex rounded-full bg-[#f3c642] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#311710]">
                Burger Cuiabar
              </span>

              <h1 className="mt-5 font-heading text-[clamp(3.25rem,9vw,6.6rem)] leading-[0.84] tracking-[-0.05em] text-[#2b150f]">
                SMOKY
                <br />
                <span className="text-[#ea6a2a]">CHEESY</span>
                <br />
                BURGER
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#6b584d] sm:text-lg">
                A frente de burgers do Cuiabar agora tem presença própria na web, com cardápio organizado, visual forte e acesso direto aos apps de pedido.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href={siteConfig.burguerOrderLinks.ifood} target="_blank" rel="noreferrer" className={primaryButtonClass}>
                  🛵 Pedir no iFood
                </a>
                <a href={siteConfig.burguerOrderLinks.food99} target="_blank" rel="noreferrer" className={secondaryButtonClass}>
                  Pedir no 99Food
                </a>
              </div>

              <div className="mt-5 flex flex-wrap gap-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#8b776d]">
                <span>📍 Campinas</span>
                <span>🕕 Qua–Sáb a partir das 18h</span>
                <span>🍔 Cardápio próprio</span>
              </div>
            </div>

            <div className="relative min-h-[25rem] sm:min-h-[32rem] lg:min-h-[40rem]">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="pointer-events-none select-none font-heading text-[clamp(6rem,20vw,15rem)] leading-[0.82] tracking-[-0.08em] text-[#321a12]/[0.08]">
                  BURGER
                  <br />
                  CUIABAR
                </span>
              </div>

              <div className="absolute right-[4%] top-[8%] h-[76%] w-[62%] rounded-[2.5rem] bg-[#ea6a2a] shadow-[0_42px_84px_-46px_rgba(126,57,27,0.56)] sm:rounded-[3rem]" />
              <div className="absolute left-[8%] top-[24%] rounded-full bg-[#355f46] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_40px_-24px_rgba(53,95,70,0.62)]">
                Projeto piloto Cuiabar
              </div>
              <div className="absolute right-[10%] top-[14%] flex h-12 w-12 items-center justify-center rounded-full bg-[#f3c642] text-xl shadow-[0_16px_36px_-22px_rgba(49,23,16,0.48)] sm:h-14 sm:w-14">
                🍔
              </div>

              <div className="relative mx-auto flex h-full max-w-[38rem] items-center justify-center">
                <img
                  src="/burguer/o-colosso.webp"
                  alt="Burger Cuiabar O Colosso"
                  loading="eager"
                  className="burger-float-slow relative z-10 w-full max-w-[36rem] object-contain drop-shadow-[0_34px_40px_rgba(49,23,16,0.24)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cardapio" className="bg-[#2a140d] text-[#fff5ea]">
        <div className="container-shell py-12 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className="max-w-sm">
              <span className="inline-flex rounded-full bg-[#f3c642] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#311710]">
                Cardápio
              </span>
              <h2 className="mt-4 font-heading text-4xl leading-[0.92] sm:text-5xl">Nossos burgers.</h2>
              <p className="mt-4 text-sm leading-relaxed text-[#dccdc1] sm:text-base">
                Fotos atualizadas, nomes organizados e leitura simples para o cliente chegar rápido ao pedido.
              </p>
            </div>

            <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
              {burgers.map((item) => (
                <article
                  key={item.name}
                  className="mb-5 break-inside-avoid overflow-hidden rounded-[2rem] border border-white/10 bg-[#3a2018] p-4 shadow-[0_22px_46px_-34px_rgba(0,0,0,0.4)]"
                >
                  <div className="overflow-hidden rounded-[1.5rem] bg-[#4a281d]">
                    <img src={item.image} alt={item.name} loading="lazy" className="h-auto w-full object-cover" />
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-[2rem] leading-none text-white">{item.name}</h3>
                      {item.note ? (
                        <span className="rounded-full bg-[#f3c642] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#311710]">
                          {item.note}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-[#dacabe]">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="destaques" className="bg-[#f3c642] text-[#311710]">
        <div className="container-shell py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <span className="inline-flex rounded-full bg-[#2a140d] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#fff5ea]">
              Destaques
            </span>
            <h2 className="mt-4 font-heading text-4xl leading-[0.92] sm:text-5xl">Por que pedir no Burger Cuiabar?</h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {highlights.map((item) => (
                <article key={item.title} className="rounded-[1.8rem] bg-[#f7db76] p-5 shadow-[0_18px_40px_-28px_rgba(49,23,16,0.26)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ea6a2a] text-xl text-white">{item.icon}</div>
                  <h3 className="mt-4 font-heading text-2xl leading-none">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#5f4639]">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pedir" className="bg-[#f6f0e8] text-[#311710]">
        <div className="container-shell py-12 sm:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full bg-[#f3c642] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#311710]">
              Onde pedir
            </span>
            <h2 className="mt-4 font-heading text-4xl leading-[0.92] sm:text-5xl">Escolha sua plataforma.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#6b584d] sm:text-base">
              O Burger Cuiabar está estruturado para fortalecer presença própria na busca e levar o pedido direto para os apps oficiais.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <a
                href={siteConfig.burguerOrderLinks.ifood}
                target="_blank"
                rel="noreferrer"
                className="rounded-[2rem] bg-[#ea6a2a] p-6 text-left text-white shadow-[0_26px_60px_-34px_rgba(234,106,42,0.78)] transition hover:-translate-y-1"
              >
                <p className="text-2xl">🛵</p>
                <h3 className="mt-4 font-heading text-3xl leading-none">Pedir no iFood</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/84">Canal principal para abrir, pedir e acompanhar o lanche dentro do app.</p>
              </a>

              <a
                href={siteConfig.burguerOrderLinks.food99}
                target="_blank"
                rel="noreferrer"
                className="rounded-[2rem] border border-[#ddd2c7] bg-white p-6 text-left shadow-[0_22px_50px_-34px_rgba(49,23,16,0.18)] transition hover:-translate-y-1"
              >
                <p className="text-2xl">📱</p>
                <h3 className="mt-4 font-heading text-3xl leading-none">Pedir no 99Food</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#6b584d]">Alternativa oficial para ganhar alcance adicional e manter pedido direto no app.</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#2a140d] text-[#fff5ea]">
        <div className="container-shell py-12 sm:py-16">
          <div className="mx-auto max-w-3xl rounded-[2.2rem] bg-[#3a2018] px-6 py-8 text-center shadow-[0_26px_60px_-34px_rgba(0,0,0,0.4)] sm:px-10">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ea6a2a] text-xl">📸</div>
            <h2 className="mt-5 font-heading text-3xl leading-[0.95] sm:text-4xl">Siga o Burger Cuiabar.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#d7c6ba] sm:text-base">
              Novidades, operação da noite, fotos dos lanches e avisos rápidos no Instagram oficial.
            </p>
            <div className="mt-6">
              <a href="https://instagram.com/burgercuiabar" target="_blank" rel="noreferrer" className={primaryButtonClass}>
                @burgercuiabar
              </a>
            </div>
          </div>

          <footer className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-6 text-sm text-[#d7c6ba] sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#fff2da]">
                <img src={siteConfig.burguerLogoUrl} alt="Logo do Burger Cuiabar" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="font-heading text-lg leading-none text-white">Burger Cuiabar</p>
                <p className="text-xs uppercase tracking-[0.16em] text-[#cdb9ab]">burger.cuiabar.com</p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.14em] text-[#cdb9ab]">
              <a href="#cardapio" className="transition hover:text-[#f3c642]">
                Cardápio
              </a>
              <a href="#destaques" className="transition hover:text-[#f3c642]">
                Destaques
              </a>
              <a href="#pedir" className="transition hover:text-[#f3c642]">
                Onde pedir
              </a>
            </nav>

            <p className="text-xs uppercase tracking-[0.14em] text-[#bba89b]">© 2026 Burger Cuiabar</p>
          </footer>
        </div>
      </section>
    </main>
  );
};

export default BurguerCuiabarPage;
