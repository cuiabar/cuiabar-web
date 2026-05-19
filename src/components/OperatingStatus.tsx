import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

type ServiceWindow = {
  label: string;
  days: number[];
  opens: string;
  closes: string;
};

const serviceWindows: ServiceWindow[] = [
  { label: 'Delivery', days: [0, 1, 2, 3, 4, 5, 6], opens: '11:00', closes: '14:30' },
  { label: 'Presencial', days: [4], opens: '11:00', closes: '14:30' },
  { label: 'Presencial', days: [5], opens: '11:00', closes: '14:30' },
  { label: 'Presencial', days: [5], opens: '18:00', closes: '23:00' },
  { label: 'Presencial', days: [6], opens: '11:00', closes: '15:00' },
  { label: 'Presencial', days: [6], opens: '18:00', closes: '23:00' },
];

const dayLabels = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

const toMinutes = (time: string) => {
  const [hour = '0', minute = '0'] = time.split(':');
  return Number(hour) * 60 + Number(minute);
};

const formatHour = (time: string) => time.replace(':00', 'h').replace(':30', 'h30');

const getOperatingStatus = (now: Date) => {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  const current = serviceWindows.find((service) => {
    const opens = toMinutes(service.opens);
    const closes = toMinutes(service.closes);

    return service.days.includes(day) && minutes >= opens && minutes < closes;
  });

  if (current) {
    return {
      isOpen: true,
      title: `${current.label} aberto agora`,
      detail: `Atendimento até ${formatHour(current.closes)}.`,
    };
  }

  for (let offset = 0; offset < 7; offset += 1) {
    const targetDay = (day + offset) % 7;
    const candidates = serviceWindows
      .filter((service) => service.days.includes(targetDay))
      .sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens));
    const next = candidates.find((service) => offset > 0 || toMinutes(service.opens) > minutes);

    if (next) {
      return {
        isOpen: false,
        title: 'Fechado no momento',
        detail: `Próxima abertura: ${offset === 0 ? 'hoje' : dayLabels[targetDay]}, ${formatHour(next.opens)}.`,
      };
    }
  }

  return {
    isOpen: false,
    title: 'Fechado no momento',
    detail: 'Consulte os canais oficiais para o próximo atendimento.',
  };
};

type OperatingStatusProps = {
  className?: string;
};

export const OperatingStatus = ({ className = '' }: OperatingStatusProps) => {
  const [status, setStatus] = useState(() => getOperatingStatus(new Date()));

  useEffect(() => {
    const update = () => setStatus(getOperatingStatus(new Date()));
    update();

    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className={`inline-flex w-full items-start gap-3 rounded-[1rem] border bg-white/80 px-4 py-3 shadow-[0_18px_48px_-38px_rgba(51,35,19,0.55)] backdrop-blur sm:w-auto ${status.isOpen ? 'border-[#5f9c62]/30' : 'border-terracotta/18'} ${className}`}
      aria-live="polite"
    >
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${status.isOpen ? 'bg-[#4f9854]' : 'bg-terracotta'}`} aria-hidden="true" />
      <div>
        <p className="flex items-center gap-2 text-sm font-bold text-cocoa">
          <Clock aria-hidden="true" className="h-4 w-4 text-terracotta" />
          {status.title}
        </p>
        <p className="mt-1 text-sm leading-snug text-steel">{status.detail}</p>
      </div>
    </div>
  );
};
