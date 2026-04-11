type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
};

export const SectionHeading = ({ eyebrow, title, description, align = 'left' }: SectionHeadingProps) => (
  <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
    {eyebrow ? <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">{eyebrow}</p> : null}
    <h2 className="font-heading text-3xl leading-tight text-cocoa sm:text-4xl">{title}</h2>
    {description ? <p className="mt-4 text-base leading-relaxed text-steel">{description}</p> : null}
  </div>
);
