import { ProcedureListPage } from './ProcedureListPage';
import { deliveryProcedures } from '../data/delivery';

const DeliveryPage = () => (
  <ProcedureListPage
    title="Delivery"
    description="Fluxo operacional para recebimento, conferencia, embalagem, lacre, despacho e canais oficiais."
    procedures={deliveryProcedures}
  />
);

export default DeliveryPage;
