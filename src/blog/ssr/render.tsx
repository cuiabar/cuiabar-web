import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { blogSeoRoutes } from '../blogSeo';
import { StaticBlogApp } from './StaticBlogApp';

export { blogSeoRoutes };

export const renderRoute = (routePath: string) =>
  renderToString(
    <StaticRouter location={routePath}>
      <StaticBlogApp />
    </StaticRouter>,
  );
