import { Suspense, lazy } from 'react';
import { Toaster } from "@meucuiabar/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@meucuiabar/lib/query-client'
import { pagesConfig } from './pages.config'
import { Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { MEUCUIABAR_BASE_PATH } from '@meucuiabar/config';

const pageModules = import.meta.glob('./pages/*.jsx');
const pageKeys = pagesConfig.pageKeys ?? [];

const Pages = Object.fromEntries(
  pageKeys.map((pageKey) => {
    const loader = pageModules[`./pages/${pageKey}.jsx`];

    if (!loader) {
      throw new Error(`Pagina MeuCuiabar nao encontrada: ${pageKey}`);
    }

    return [pageKey, lazy(loader)];
  }),
);

const { Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? pageKeys[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;
const withBasePath = (path = '') => {
  const basePath = MEUCUIABAR_BASE_PATH || '';
  const normalizedPath = path ? `/${path.replace(/^\/+/, '')}` : '';
  return `${basePath}${normalizedPath}` || '/';
};

const mainRoutePath = withBasePath();
const shouldRedirectRoot = mainRoutePath !== '/';

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const PageLoadingState = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
    Carregando modulo...
  </div>
);

const renderPageElement = (Page, currentPageName) => (
  <LayoutWrapper currentPageName={currentPageName}>
    <Suspense fallback={<PageLoadingState />}>
      <Page />
    </Suspense>
  </LayoutWrapper>
);

const MeuCuiabarRuntime = () => {
  return (
    <Routes>
      {shouldRedirectRoot ? <Route path="/" element={<Navigate to={mainRoutePath} replace />} /> : null}
      <Route path={mainRoutePath} element={renderPageElement(MainPage, mainPageKey)} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={withBasePath(path)}
          element={renderPageElement(Page, path)}
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <QueryClientProvider client={queryClientInstance}>
      <MeuCuiabarRuntime />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
