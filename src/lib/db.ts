import { getDbConfig } from "./db-config";

const globalKey = "__DLT_DB_POOL__";

function getGlobalPool(): DbPool | null {
  return ((globalThis as Record<string, unknown>)[globalKey] as DbPool) ?? null;
}

function setGlobalPool(p: DbPool | null) {
  (globalThis as Record<string, unknown>)[globalKey] = p;
}

let pending: Promise<DbPool> | null = null;

interface DbPool {
  connected: boolean;
  connect(): Promise<void>;
  request(): DbRequest;
  close(): Promise<void>;
  setMaxListeners(n: number): this;
  on(event: string, handler: (...args: any[]) => void): this;
}

interface DbRequest {
  input(name: string, value: unknown): void;
  query<T>(query: string): Promise<{ recordset: T[] }>;
  execute<T>(procName: string): Promise<{ recordset: T[] }>;
}

async function getMssql() {
  return await import("mssql");
}

export async function getDbPool(): Promise<DbPool> {
  const existing = getGlobalPool();
  if (existing?.connected) {
    return existing;
  }

  if (pending) {
    return pending;
  }

  pending = (async () => {
    const sql = await getMssql();
    const config = getDbConfig();

    const sqlConfig: Record<string, unknown> = {
      server: config.server,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      options: {
        encrypt: config.options.encrypt,
        trustServerCertificate: config.options.trustServerCertificate,
      },
      connectionTimeout: 15000,
      requestTimeout: 30000,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };

    const newPool = new sql.ConnectionPool(sqlConfig as any) as unknown as DbPool;
    newPool.setMaxListeners(50);

    newPool.on("error", (err: Error) => {
      console.error("[db] Connection pool error:", err.message);
      if (getGlobalPool() === newPool) {
        setGlobalPool(null);
      }
    });

    await newPool.connect();
    setGlobalPool(newPool);
    return newPool;
  })();

  try {
    return await pending;
  } finally {
    pending = null;
  }
}

export async function executeQuery<T>(
  query: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const db = await getDbPool();
  const request = db.request();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }

  const result = await request.query<T>(query);
  return result.recordset;
}

export async function executeProc<T>(
  procName: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const db = await getDbPool();
  const request = db.request();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }

  const result = await request.execute<T>(procName);
  return result.recordset;
}

export async function closePool(): Promise<void> {
  const existing = getGlobalPool();
  if (existing) {
    try {
      await existing.close();
    } catch {
      // ignore close errors
    }
    setGlobalPool(null);
  }
}
