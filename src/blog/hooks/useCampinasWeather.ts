import { useEffect, useState } from 'react';
import { blogConfig } from '../blogConfig';

type WeatherState = {
  label: string;
  temperature: number;
  apparentTemperature: number;
  precipitation: number;
  weatherCode: number;
};

const weatherCodeLabels: Record<number, string> = {
  0: 'ceu limpo',
  1: 'sol com poucas nuvens',
  2: 'parcialmente nublado',
  3: 'ceu encoberto',
  45: 'nevoeiro leve',
  48: 'nevoeiro',
  51: 'garoa fraca',
  53: 'garoa',
  55: 'garoa intensa',
  61: 'chuva fraca',
  63: 'chuva moderada',
  65: 'chuva forte',
  80: 'pancadas isoladas',
  81: 'pancadas moderadas',
  82: 'pancadas fortes',
  95: 'trovoadas',
};

const toLabel = (weatherCode: number, precipitation: number) => {
  if (precipitation > 1) {
    return 'chuva no radar';
  }

  return weatherCodeLabels[weatherCode] ?? 'tempo variando';
};

export const getWeatherEditorialNote = (weather: WeatherState | null) => {
  if (!weather) {
    return 'Sinal do tempo carregando para afinar os CTAs do blog em tempo real.';
  }

  if (weather.precipitation > 0.8 || [61, 63, 65, 80, 81, 82, 95].includes(weather.weatherCode)) {
    return 'Clima pedindo reserva organizada, mesa coberta e pratos que seguram a noite.';
  }

  if (weather.temperature >= 29) {
    return 'Noite boa para drinks gelados, chope e um roteiro mais leve de fim de tarde.';
  }

  if (weather.temperature <= 19) {
    return 'Temperatura mais baixa combina com jantar estendido, mesa longa e ritmo mais acolhedor.';
  }

  return 'Tempo equilibrado para ativar agenda, playlist da semana e visitas sem muito atrito.';
};

export const useCampinasWeather = () => {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      latitude: String(blogConfig.weatherLatitude),
      longitude: String(blogConfig.weatherLongitude),
      current: 'temperature_2m,apparent_temperature,precipitation,weather_code',
      timezone: blogConfig.weatherTimezone,
      forecast_days: '1',
    });

    void fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Weather request failed: ${response.status}`);
        }

        return response.json() as Promise<{
          current?: {
            temperature_2m?: number;
            apparent_temperature?: number;
            precipitation?: number;
            weather_code?: number;
          };
        }>;
      })
      .then((data) => {
        const current = data.current;

        if (
          current?.temperature_2m === undefined ||
          current.apparent_temperature === undefined ||
          current.precipitation === undefined ||
          current.weather_code === undefined
        ) {
          return;
        }

        setWeather({
          label: toLabel(current.weather_code, current.precipitation),
          temperature: current.temperature_2m,
          apparentTemperature: current.apparent_temperature,
          precipitation: current.precipitation,
          weatherCode: current.weather_code,
        });
      })
      .catch((error) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  return { weather, isLoading, editorialNote: getWeatherEditorialNote(weather) };
};
