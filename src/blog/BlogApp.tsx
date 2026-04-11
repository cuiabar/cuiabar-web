import { Route, Routes } from 'react-router-dom';
import { BlogLayout } from './BlogLayout';
import { BlogHomePage } from './BlogHomePage';
import { BlogPostPage } from './BlogPostPage';

export const BlogApp = () => (
  <BlogLayout>
    <Routes>
      <Route path="/" element={<BlogHomePage />} />
      <Route path="/:slug" element={<BlogPostPage />} />
    </Routes>
  </BlogLayout>
);
