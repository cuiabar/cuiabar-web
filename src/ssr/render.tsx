import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { StaticSiteApp } from './StaticSiteApp';

export const renderRoute = (routePath: string) =>
  renderToString(
    <StaticRouter location={routePath}>
      <StaticSiteApp />
    </StaticRouter>,
  );
