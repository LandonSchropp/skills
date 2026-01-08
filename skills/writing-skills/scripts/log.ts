import type { RunIdentifier } from "./types";

const COLORS = {
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
} as const;

const NO_COLOR = "\x1b[0m";

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
  const { scenarioIndex, iteration } = runIdentifier ?? {};

  let formattedMessage = [
    ...(scenarioIndex === undefined ? [] : [`Scenario ${scenarioIndex}`]),
    ...(iteration === undefined ? [] : [`Iteration ${iteration}`]),
    message,
  ].join(" - ");

  // Log the message to stderr with color
  console.error(`${COLORS[color]}${formattedMessage}${NO_COLOR}`);
}
