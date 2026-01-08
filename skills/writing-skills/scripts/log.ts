const COLORS = {
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
} as const;

const NO_COLOR = "\x1b[0m";

/**
 * Logs a message to stderr with optional scenario and run numbers.
 *
 * @param message The message to log.
 * @param scenarioNumber Optional scenario number to include in the log.
 * @param runNumber - Optional run number to include in the log.
 */
export function log({
  message,
  scenarioNumber,
  runNumber,
  color,
}: {
  message: string;
  scenarioNumber?: number;
  runNumber?: number;
  color?: keyof typeof COLORS;
}): void {
  let formattedMessage = [
    ...(scenarioNumber === undefined ? [] : [`Scenario ${scenarioNumber}`]),
    ...(runNumber === undefined ? [] : [`Run ${runNumber}`]),
    message,
  ].join(" - ");

  // Log the message to stderr with blue color
  console.error(`${color ? COLORS[color] : NO_COLOR}${formattedMessage}${NO_COLOR}`);
}
