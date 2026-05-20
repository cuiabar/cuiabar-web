import { ProcedureListPage } from './ProcedureListPage';
import { conversaoProcedures } from '../data/conversao';

const ConversaoPage = () => (
  <ProcedureListPage
    title="Conversao de Vendas"
    description="Procedimentos para venda adicional, combos, bebidas, sobremesas, objecoes, upsell e cross-sell."
    procedures={conversaoProcedures}
  />
);

export default ConversaoPage;
