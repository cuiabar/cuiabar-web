import { Link } from 'react-router-dom';
import { Button, PageHeader, Panel } from '../../crm/components';

export const MeuCuiabarHubPage = ({ basePath = '' }: { basePath?: string }) => {
  const auditPath = `${basePath}/meucuiabar/auditoria`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="MeuCuiabar"
        description="Primeiro bloco interno da casa, separado do atendimento comercial. Aqui ficam governanca, qualidade, HACCP e rotinas operacionais."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Panel className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">Operacao da casa</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Bloco inicial aberto</h2>
            <p className="mt-2 text-sm text-slate-300">
              MeuCuiabar deixa de ficar implicito dentro do CRM. A partir daqui, controles internos passam a ter trilha
              propria e deixam de disputar identidade com Cuiabar Atende.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Governanca</p>
              <p className="mt-2 text-sm text-slate-200">Auditoria administrativa, trilha de acao e base para responsabilidade operacional.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Qualidade</p>
              <p className="mt-2 text-sm text-slate-200">Area reservada para checklists, verificacoes de processo e indicadores internos.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">HACCP</p>
              <p className="mt-2 text-sm text-slate-200">Espaco reservado para pontos criticos, conformidade e rotinas de seguranca operacional.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to={auditPath}>
              <Button>Ver auditoria interna</Button>
            </Link>
          </div>
        </Panel>

        <Panel className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Proximas extracoes</h2>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Checklists operacionais por turno</li>
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Rotinas de qualidade e conformidade</li>
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Base HACCP e controles internos da cozinha</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
};
