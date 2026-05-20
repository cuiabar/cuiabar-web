import { ProcedureListPage } from './ProcedureListPage';
import { popsProcedures } from '../data/pops';

const PopsPage = () => (
  <ProcedureListPage
    title="POPs"
    description="Procedimentos operacionais padrao para higiene, sanitizacao, validade, temperatura e contaminacao cruzada."
    procedures={popsProcedures}
  />
);

export default PopsPage;
