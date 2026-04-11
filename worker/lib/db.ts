export const nowIso = () => new Date().toISOString();

export const asJson = <T>(value: T) => JSON.stringify(value ?? {});

export const parseJsonText = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const first = async <T>(statement: D1PreparedStatement): Promise<T | null> => {
  const row = await statement.first<T>();
  return row ?? null;
};

export const all = async <T>(statement: D1PreparedStatement): Promise<T[]> => {
  const result = await statement.all<T>();
  return result.results ?? [];
};

export const run = async (statement: D1PreparedStatement) => statement.run();

export const parseBoolean = (value: string | undefined, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  return value === 'true' || value === '1';
};

export const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
