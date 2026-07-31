import { createApp } from "./app";
import { loadConfig } from "./config";

const config = loadConfig();
const app = await createApp({ config });

const close = async (signal: string) => {
  app.log.info({ signal }, "Encerrando API");
  await app.close();
  process.exit(0);
};

process.once("SIGINT", () => void close("SIGINT"));
process.once("SIGTERM", () => void close("SIGTERM"));

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

