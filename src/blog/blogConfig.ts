import { siteConfig } from '../data/siteConfig';

const trimValue = (value: string | undefined) => value?.trim() || '';

const resolveBaseUrl = () => {
  const envValue = trimValue(import.meta.env.VITE_BLOG_SITE_URL);
  return envValue || 'https://cuiabar-blog.pages.dev';
};

const resolveAbsoluteUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${resolveBaseUrl()}${normalizedPath}`;
};

export const blogConfig = {
  siteName: 'Blog Cuiabar',
  siteUrl: resolveBaseUrl(),
  description:
    'Hub editorial da Cuiabar com agenda, guias locais, gastronomia e sinais em tempo real para Campinas.',
  weatherLatitude: Number(import.meta.env.VITE_BLOG_WEATHER_LAT || siteConfig.geo.latitude),
  weatherLongitude: Number(import.meta.env.VITE_BLOG_WEATHER_LON || siteConfig.geo.longitude),
  weatherTimezone: trimValue(import.meta.env.VITE_BLOG_WEATHER_TIMEZONE) || 'America/Sao_Paulo',
  weatherCityLabel: trimValue(import.meta.env.VITE_BLOG_WEATHER_CITY_LABEL) || 'Campinas',
  whatsappChannelUrl: trimValue(import.meta.env.VITE_BLOG_WHATSAPP_CHANNEL_URL) || siteConfig.whatsappChannelUrl,
  whatsappContactUrl: `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent('Ola! Vim pelo blog da Cuiabar e quero falar com a equipe.')}`,
  reservationUrl: siteConfig.reservationPortalUrl,
  agendaUrl: 'https://cuiabar.com/agenda',
  menuUrl: 'https://cuiabar.com/menu',
  homeUrl: 'https://cuiabar.com',
  mainSiteLabel: siteConfig.brandShortName,
  defaultImage: `${resolveBaseUrl()}${siteConfig.logoUrl}`,
  resolveAbsoluteUrl,
};
