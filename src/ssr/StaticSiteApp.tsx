import { Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout';
import ExpressoPage from '../pages/ExpressoPage';
import DeliveryPage from '../pages/DeliveryPage';
import HomePage from '../pages/HomePage';
import MenuPage from '../pages/MenuPage';
import ProRefeicaoPage from '../pages/ProRefeicaoPage';
import PedidosOnlinePage from '../pages/PedidosOnlinePage';
import PesquisaPage from '../pages/PesquisaPage';
import PresencialPage from '../pages/PresencialPage';
import ReservasPage from '../pages/ReservasPage';
import AgendaPage from '../pages/AgendaPage';
import AgendaEventPage from '../pages/AgendaEventPage';
import BlogSubdomainRedirectPage from '../pages/BlogSubdomainRedirectPage';
import VagasPage from '../pages/VagasPage';
import EspetariaCuiabarPage from '../pages/EspetariaCuiabarPage';
import LinksPage from '../pages/LinksPage';
import LocalGuidePage from '../pages/LocalGuidePage';
import OsHome from '../modules/os/pages/OsHome';
import OsAtendimentoPage from '../modules/os/pages/AtendimentoPage';
import OsDeliveryPage from '../modules/os/pages/DeliveryPage';
import OsPopsPage from '../modules/os/pages/PopsPage';
import OsConversaoPage from '../modules/os/pages/ConversaoPage';
import OsRecomendacoesPage from '../modules/os/pages/RecomendacoesPage';

export const StaticSiteApp = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/presencial" element={<PresencialPage />} />
      <Route path="/expresso" element={<ExpressoPage />} />
      <Route path="/agenda" element={<AgendaPage />} />
      <Route path="/agenda/:eventSlug" element={<AgendaEventPage />} />
      <Route path="/blog" element={<BlogSubdomainRedirectPage />} />
      <Route path="/blog/:slug" element={<BlogSubdomainRedirectPage />} />
      <Route path="/delivery" element={<DeliveryPage />} />
      <Route path="/espetaria" element={<EspetariaCuiabarPage />} />
      <Route path="/links" element={<LinksPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/prorefeicao" element={<ProRefeicaoPage />} />
      <Route path="/pedidos-online" element={<PedidosOnlinePage />} />
      <Route path="/pesquisa" element={<PesquisaPage />} />
      <Route path="/reservas" element={<ReservasPage />} />
      <Route path="/restaurante-brasileiro-campinas" element={<LocalGuidePage pageKey="restauranteCampinas" />} />
      <Route path="/bar-musica-ao-vivo-campinas" element={<LocalGuidePage pageKey="barMusicaCampinas" />} />
      <Route path="/restaurante-delivery-campinas" element={<LocalGuidePage pageKey="restauranteDeliveryCampinas" />} />
      <Route path="/vagas" element={<VagasPage />} />
      <Route path="/os" element={<OsHome />} />
      <Route path="/os/atendimento" element={<OsAtendimentoPage />} />
      <Route path="/os/delivery" element={<OsDeliveryPage />} />
      <Route path="/os/pops" element={<OsPopsPage />} />
      <Route path="/os/conversao" element={<OsConversaoPage />} />
      <Route path="/os/recomendacoes" element={<OsRecomendacoesPage />} />
    </Routes>
  </Layout>
);
