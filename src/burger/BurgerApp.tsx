import { Navigate, Route, Routes } from 'react-router-dom';
import { AnalyticsTracker } from '../components/AnalyticsTracker';
import { ScrollManager } from '../components/ScrollManager';
import BurguerCuiabarPage from '../pages/BurguerCuiabarPage';

export const BurgerApp = () => (
  <>
    <AnalyticsTracker />
    <ScrollManager />
    <main>
      <Routes>
        <Route path="/" element={<BurguerCuiabarPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </>
);
