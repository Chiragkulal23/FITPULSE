import { existsSync } from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envDir = path.resolve(__dirname, "../env");

dotenv.config({ path: path.join(envDir, ".env") });
dotenv.config({ path: path.join(envDir, ".env.local"), override: true });

const examplePath = path.join(envDir, ".env.example");
if ((!process.env.JWT_SECRET || !process.env.MONGO_URI) && existsSync(examplePath)) {
  dotenv.config({ path: examplePath });
}
