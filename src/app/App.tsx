import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ClientRedirect } from '../components/ClientRedirect';
import { Layout } from '../components/Layout';

const HomePage = lazy(() => import('../pages/HomePage'));
const PresencialPage = lazy(() => import('../pages/PresencialPage'));
const MenuPage = lazy(() => import('../pages/MenuPage'));
const ProRefeicaoPage = lazy(() => import('../pages/ProRefeicaoPage'));
const ExpressoPage = lazy(() => import('../pages/ExpressoPage'));
const DeliveryPage = lazy(() => import('../pages/DeliveryPage'));
const PesquisaPage = lazy(() => import('../pages/PesquisaPage'));
const ReservasPage = lazy(() => import('../pages/ReservasPage'));
const AgendaPage = lazy(() => import('../pages/AgendaPage'));
const AgendaEventPage = lazy(() => import('../pages/AgendaEventPage'));
const BlogSubdomainRedirectPage = lazy(() => import('../pages/BlogSubdomainRedirectPage'));
const VagasPage = lazy(() => import('../pages/VagasPage'));
const EspetariaCuiabarPage = lazy(() => import('../pages/EspetariaCuiabarPage'));
const LinksPage = lazy(() => import('../pages/LinksPage'));
const LocalGuidePage = lazy(() => import('../pages/LocalGuidePage'));
const OsHome = lazy(() => import('../modules/os/pages/OsHome'));
const OsAtendimentoPage = lazy(() => import('../modules/os/pages/AtendimentoPage'));
const OsDeliveryPage = lazy(() => import('../modules/os/pages/DeliveryPage'));
const OsPopsPage = lazy(() => import('../modules/os/pages/PopsPage'));
const OsConversaoPage = lazy(() => import('../modules/os/pages/ConversaoPage'));
const OsRecomendacoesPage = lazy(() => import('../modules/os/pages/RecomendacoesPage'));

const isProRefeicaoHost = () =>
  typeof window !== 'undefined' && window.location.hostname.toLowerCase() === 'prorefeicao.cuiabar.com';

export const App = () => (
  <Suspense fallback={<div className="container-shell py-24">Carregando Villa Cuiabar...</div>}>
    <Layout>
      <Routes>
        <Route path="/" element={isProRefeicaoHost() ? <ProRefeicaoPage /> : <HomePage />} />
        <Route path="/presencial" element={<PresencialPage />} />
        <Route path="/expresso" element={<ExpressoPage />} />
        <Route path="/bio" element={<ClientRedirect to="/links" />} />
        <Route path="/acessos" element={<ClientRedirect to="/links" />} />
        <Route path="/canal" element={<ClientRedirect to="/links" />} />
        <Route path="/asianrestaurant" element={<ClientRedirect to="/presencial" />} />
        <Route path="/marmita" element={<ClientRedirect to="/expresso" />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/online-ordering" element={<ClientRedirect to="/delivery" />} />
        <Route path="/services-5" element={<ClientRedirect to="/delivery" />} />
        <Route path="/espetaria" element={<EspetariaCuiabarPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/agenda/:eventSlug" element={<AgendaEventPage />} />
        <Route path="/blog" element={<BlogSubdomainRedirectPage />} />
        <Route path="/blog/:slug" element={<BlogSubdomainRedirectPage />} />
        <Route path="/links" element={<LinksPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/prorefeicao" element={<ClientRedirect to="https://prorefeicao.cuiabar.com" />} />
        <Route path="/pedidos-online" element={<ClientRedirect to="/delivery" />} />
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
  </Suspense>
);
