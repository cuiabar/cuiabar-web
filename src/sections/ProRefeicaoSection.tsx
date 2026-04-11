import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';

export const ProRefeicaoSection = () => (
  <section className="container-shell py-12">
    <Reveal className="grid gap-6 rounded-card bg-cocoa p-8 text-white shadow-[0_32px_80px_-36px_rgba(51,35,19,0.85)] lg:grid-cols-2">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gold">Operação corporativa</p>
        <h2 className="mt-3 font-heading text-4xl">ProRefeição para empresas, escritórios, clínicas, indústrias e obras</h2>
      </div>
      <div>
        <p className="text-white/80">
          Refeições profissionais com qualidade, variedade e padrão para operações que precisam de almoço e jantar bem servidos todos os dias.
        </p>
        <Link to="/prorefeicao" className="btn-primary mt-6">Conhecer ProRefeição</Link>
      </div>
    </Reveal>
  </section>
);
