type WhatsAppContactCardProps = {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  note?: string;
};

export const WhatsAppContactCard = ({
  title,
  description,
  href,
  buttonLabel,
  note,
}: WhatsAppContactCardProps) => (
  <section className="card p-6 sm:p-8">
    <h3 className="font-heading text-2xl text-cocoa">{title}</h3>
    <p className="mt-3 text-steel">{description}</p>
    <a href={href} target="_blank" rel="noreferrer" className="btn-primary mt-6 inline-flex">
      {buttonLabel}
    </a>
    {note ? <p className="mt-4 text-sm text-steel">{note}</p> : null}
  </section>
);
