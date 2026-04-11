import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { menuSectionEmojis, menuSections } from '../data/menu';
import { getRouteSeo } from '../data/seo';
import type { MenuSection } from '../data/types';
import { siteConfig } from '../data/siteConfig';
import { useSeo } from '../hooks/useSeo';

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const totalItems = menuSections.reduce((sum, section) => sum + section.items.length, 0);

const formatDescription = (value: string) => value.replace(/^"|"$/g, '');

const menuSectionGroups: Array<{
  id: string;
  label: string;
  emoji: string;
  description: string;
  sectionNames: string[];
}> = [
  {
    id: 'porcoes',
    label: 'Porções',
    emoji: '🍟',
    description: 'Petiscos, entradas, fritos, lanches e opções para compartilhar.',
    sectionNames: [
      'Abertura de Trabalhos',
      'Os Queridinhos da Cozinha',
      'Fritinhos do Amor',
      'Pastéis',
      'Lanches',
      'Iscas Supremas',
    ],
  },
  {
    id: 'pratos',
    label: 'Pratos',
    emoji: '🍽️',
    description: 'Executivos, família, massas, saladas e complementos da casa.',
    sectionNames: [
      'Fogão Cuiabano',
      'AMORAO PRIMEIRO QUEIJO',
      'Pra quem troca o pão por paixão',
      'PRATOS FAMÍLIA',
      'PRAS CRIANÇAS',
      'Saladas Frescas',
      'Complementos',
    ],
  },
  {
    id: 'bebidas',
    label: 'Bebidas',
    emoji: '🍹',
    description: 'Cervejas, drinks, refrescos, chopp e clássicos para acompanhar.',
    sectionNames: ['CERVEJAS 600ml', 'REFRESCOS', "LONG NECK'S 330ML", 'ESPECIAL', 'Drinks Clássicos', 'Caipirinha', 'Chopp'],
  },
];

const sectionsByName = new Map(menuSections.map((section) => [section.name, section]));

const groupedMenuSections = menuSectionGroups.map((group) => ({
  ...group,
  sections: group.sectionNames
    .map((sectionName) => sectionsByName.get(sectionName))
    .filter((section): section is MenuSection => Boolean(section)),
}));

const formatVariantLine = (name: string, price: string) => (name === '-' ? price : `${name} · ${price}`);

const createSectionKey = (groupId: string, sectionName: string) => `${groupId}:${sectionName}`;

const MenuPage = () => {
  useSeo(getRouteSeo('/menu'));
  const [openSections, setOpenSections] = useState<Set<string>>(
    () =>
      new Set(
        groupedMenuSections.flatMap((group) => group.sections.slice(0, 1).map((section) => createSectionKey(group.id, section.name))),
      ),
  );

  const toggleSection = (sectionKey: string) => {
    setOpenSections((current) => {
      const next = new Set(current);

      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }

      return next;
    });
  };

  return (
    <section className="container-shell space-y-10 py-14">
      <Reveal as="header" className="card p-8">
        <SectionHeading
          eyebrow="Menu 2025"
          title="Cardápio completo"
          description="Lista direta por categoria, com leitura rápida para ver produtos, descrições e preços."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={siteConfig.orderLinks.direct} target="_blank" rel="noreferrer" className="btn-primary">
            Pedir no site
          </a>
          <Link to="/pedidos-online" className="btn-secondary">
            Ver canais de pedido
          </Link>
        </div>
        <p className="mt-4 text-sm text-steel">
          {menuSections.length} seções e {totalItems} itens entre porções, pratos, bebidas e complementos.
        </p>
      </Reveal>

      <Reveal as="nav" delay={80} className="card p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">Ir direto para a seção</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {groupedMenuSections.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="rounded-full border border-sand/70 bg-white px-4 py-2 text-sm text-cocoa transition hover:border-terracotta hover:text-terracotta"
            >
              <span className="mr-2">{group.emoji}</span>
              {group.label}
            </a>
          ))}
        </div>
      </Reveal>

      <div className="space-y-6">
        {groupedMenuSections.map((group, groupIndex) => (
          <Reveal key={group.id} as="section" id={group.id} delay={groupIndex * 90} className="space-y-6 scroll-mt-28">
            <div className="card p-6 sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">{group.emoji} Categoria</p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-heading text-3xl text-cocoa sm:text-4xl">{group.label}</h2>
                  <p className="mt-2 max-w-3xl text-sm text-steel sm:text-base">{group.description}</p>
                </div>
                <p className="text-sm font-medium text-steel">{group.sections.reduce((sum, section) => sum + section.items.length, 0)} itens</p>
              </div>
            </div>

            {group.sections.map((section) => {
              const sectionKey = createSectionKey(group.id, section.name);
              const isOpen = openSections.has(sectionKey);

              return (
                <section key={section.name} id={slugify(section.name)} className="card overflow-hidden">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 border-b border-sand/70 px-5 py-5 text-left transition hover:bg-cream/40 sm:px-7"
                    onClick={() => toggleSection(sectionKey)}
                    aria-expanded={isOpen}
                    aria-controls={`${slugify(section.name)}-content`}
                  >
                    <div className="max-w-3xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                        {menuSectionEmojis[section.name] ?? '🍽️'} Seção
                      </p>
                      <h3 className="mt-2 font-heading text-2xl text-cocoa sm:text-3xl">{section.name}</h3>
                      {section.description ? <p className="mt-2 text-sm text-steel sm:text-base">{formatDescription(section.description)}</p> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cocoa">
                        {section.items.length} itens
                      </div>
                      <span
                        aria-hidden="true"
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-sand/70 bg-white text-cocoa transition ${
                          isOpen ? 'rotate-45' : ''
                        }`}
                      >
                        +
                      </span>
                    </div>
                  </button>

                  {isOpen ? (
                    <ul id={`${slugify(section.name)}-content`} className="divide-y divide-sand/60">
                      {section.items.map((item) => (
                        <li key={`${section.name}-${item.name}-${item.description}`} className="px-5 py-4 sm:px-7">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <h4 className="font-semibold text-cocoa sm:text-lg">{item.name}</h4>
                                {item.description ? (
                                  <p className="text-sm leading-relaxed text-steel">{formatDescription(item.description)}</p>
                                ) : null}
                              </div>

                              {item.variants.length ? (
                                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-steel">
                                  {item.variants.map((variant) => (
                                    <li key={`${item.name}-${variant.name}`} className="before:mr-2 before:text-terracotta before:content-['•']">
                                      <span className="font-medium text-cocoa">{formatVariantLine(variant.name, variant.price)}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>

                            {item.price ? <p className="shrink-0 text-sm font-semibold text-terracotta sm:text-base">{item.price}</p> : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              );
            })}
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default MenuPage;
