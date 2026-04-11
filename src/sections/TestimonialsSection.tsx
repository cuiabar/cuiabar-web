import { testimonials } from '../data/content';

export const TestimonialsSection = () => (
  <section className="container-shell py-12">
    <div className="card p-6 sm:p-8">
      <h2 className="font-heading text-3xl">Quem vive o Cuiabar recomenda</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {testimonials.map((item) => (
          <blockquote key={item.name} className="rounded-2xl border border-sand/50 bg-white p-5">
            <p className="text-steel">“{item.quote}”</p>
            <footer className="mt-4 text-sm font-semibold text-cocoa">{item.name} · {item.role}</footer>
          </blockquote>
        ))}
      </div>
    </div>
  </section>
);
