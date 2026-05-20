import { ProcedureListPage } from './ProcedureListPage';
import { atendimentoProcedures } from '../data/atendimento';

const AtendimentoPage = () => (
  <ProcedureListPage
    title="Atendimento"
    description="Procedimentos para recepcao, WhatsApp, reservas, reclamacoes, recuperacao e tom de voz."
    procedures={atendimentoProcedures}
  />
);

export default AtendimentoPage;
