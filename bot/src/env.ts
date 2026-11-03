import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";

// Load .env.local first (local overrides), then .env. Values already present in
// the process environment always win, which is what hosting platforms provide.
loadDotenv({
  path: [
    fileURLToPath(new URL("../.env.local", import.meta.url)),
    fileURLToPath(new URL("../.env", import.meta.url)),
  ],
  quiet: true,
});
