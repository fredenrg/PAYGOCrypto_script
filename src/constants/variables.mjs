import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const pythonPath = join(
  __dirname,
  "..",
  "..",
  "..",
  "python",
  "tests",
  "simple_scenario_test.py"
);
