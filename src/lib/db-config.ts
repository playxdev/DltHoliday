export interface DbConfig {
  server: string;
  port: number;
  database: string;
  user: string;
  password: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

function parseDSN(dsn: string): DbConfig {
  try {
    const url = new URL(dsn);

    const user = decodeURIComponent(url.username);
    const password = decodeURIComponent(url.password);
    const server = url.hostname;
    const port = parseInt(url.pathname === "/" ? "1433" : url.port || "1433", 10);
    const database = url.searchParams.get("database") || "DLT";
    const encrypt = url.searchParams.get("encrypt") !== "disable";

    return {
      server,
      port,
      database,
      user,
      password,
      options: {
        encrypt,
        trustServerCertificate: true,
      },
    };
  } catch {
    throw new Error("Failed to parse SQLSERVER_DSN");
  }
}

function parseIndividualParams(): DbConfig | null {
  const server = process.env.DB_SERVER;
  const port = process.env.DB_PORT;
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!server || !database || !user || !password) {
    return null;
  }

  return {
    server,
    port: parseInt(port || "1433", 10),
    database,
    user,
    password,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
}

let cachedConfig: DbConfig | null = null;

export function getDbConfig(): DbConfig {
  if (cachedConfig) return cachedConfig;

  const individualConfig = parseIndividualParams();
  if (individualConfig) {
    cachedConfig = individualConfig;
    return cachedConfig;
  }

  const dsn = process.env.SQLSERVER_DSN;
  if (dsn) {
    cachedConfig = parseDSN(dsn);
    return cachedConfig;
  }

  throw new Error(
    "Database configuration not found. Set SQLSERVER_DSN or DB_SERVER/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD environment variables."
  );
}

export function getDbConfigSummary(): Omit<DbConfig, "password"> {
  const config = getDbConfig();
  return {
    server: config.server,
    port: config.port,
    database: config.database,
    user: config.user,
    options: config.options,
  };
}
