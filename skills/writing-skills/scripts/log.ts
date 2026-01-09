import type { RunIdentifier } from "./types";

const COLORS = {
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
} as const;

const NO_COLOR = "\x1b[0m";

/**
 * Builds a formatted run identifier string.
 *
 * @param runIdentifier Optional run identifier containing scenarioIndex and iteration.
 * @returns Formatted run identifier string.
 */
function buildRunIdentifier(runIdentifier?: Partial<RunIdentifier>): string {
  if (!runIdentifier) {
    return "        ";
  }

  let { scenarioIndex: scenario, iteration } = runIdentifier;

  if (scenario === undefined && iteration === undefined) {
    return "        ";
  }

  const scenarioPart = scenario === undefined ? "" : `S${String(scenario).padStart(2, "0")}`;
  const iterationPart = iteration === undefined ? "" : `I${String(iteration).padStart(2, "0")}`;

  return `[${scenarioPart}${iterationPart}]`.padEnd(8);
}

/**
 * Logs a message to stderr with optional scenario and iteration numbers.
 *
 * @param message The message to log.
 * @param color Color for the log message.
 * @param runIdentifier Optional run identifier.
 */
export function log(
  message: string,
  color: keyof typeof COLORS,
  runIdentifier?: Partial<RunIdentifier>,
): void {
  const runIdentifierString = buildRunIdentifier(runIdentifier);
  const timestamp = new Date().toISOString();

  // Log the message to stderr with color
  console.error(`${COLORS[color]}${timestamp} ${runIdentifierString} ${message}${NO_COLOR}`);
}
