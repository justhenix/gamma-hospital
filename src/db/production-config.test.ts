import assert from "node:assert/strict";
import test from "node:test";

test("Turso marketplace variables configure the runtime and migration client", async () => {
  const previous = {
    databaseUrl: process.env.DATABASE_URL,
    databaseAuthToken: process.env.DATABASE_AUTH_TOKEN,
    tursoDatabaseUrl: process.env.TURSO_DATABASE_URL,
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
  };

  process.env.DATABASE_URL = "";
  process.env.DATABASE_AUTH_TOKEN = "";
  process.env.TURSO_DATABASE_URL = "libsql://example.turso.io";
  process.env.TURSO_AUTH_TOKEN = "test-token";

  try {
    const [{ db }, { default: drizzleConfig }] = await Promise.all([
      import("./index"),
      import("../../drizzle.config"),
    ]);

    const client = (db as unknown as { $client: { protocol: string } }).$client;
    const config = drizzleConfig as unknown as {
      dbCredentials: { url: string; authToken?: string };
    };

    assert.equal(client.protocol, "http");
    assert.equal(config.dbCredentials.url, "libsql://example.turso.io");
    assert.equal(config.dbCredentials.authToken, "test-token");
  } finally {
    restoreEnv("DATABASE_URL", previous.databaseUrl);
    restoreEnv("DATABASE_AUTH_TOKEN", previous.databaseAuthToken);
    restoreEnv("TURSO_DATABASE_URL", previous.tursoDatabaseUrl);
    restoreEnv("TURSO_AUTH_TOKEN", previous.tursoAuthToken);
  }
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
