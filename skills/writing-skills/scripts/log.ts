import type { RunIdentifier } from "./types";
import { glob } from "fs/promises";
import { basename, join } from "path";

const COLORS = {
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  none: "\x1b[0m",
} as const;

// Map file names to colors
const FILE_COLORS: Record<string, keyof typeof COLORS> = {
  "evaluate-skill.ts": "magenta",
  "run-scenario.ts": "cyan",
  "evaluate-scenario.ts": "blue",
};

// The maximum length of the run identifier string
const MAX_RUN_IDENTIFIER_LENGTH = 8;

// Determine max filename length from scripts directory
const SCRIPTS_DIR = join(import.meta.dir);
const TYPESCRIPT_FILES = await Array.fromAsync(glob("**/*.ts", { cwd: SCRIPTS_DIR }));
const MAX_FILENAME_LENGTH = Math.max(...TYPESCRIPT_FILES.map((file) => basename(file).length));

/**
 * Formats a log part by wrapping it in brackets and padding to a fixed width.
 *
 * @param value The value to format, or undefined for empty padding.
 * @param maxLength The maximum length of the content (excluding brackets). Defaults to the value's
 *   length.
 * @returns The formatted and padded string.
 */
function formatLogPart(value: string | undefined, maxLength?: number): string {
  if (!value) {
    return maxLength !== undefined ? "".padEnd(maxLength + 2) : "";
  }
  const length = maxLength !== undefined ? maxLength : value.length;
  return `[${value}]`.padEnd(length + 2);
}

/**
 * Determines the calling file name from the stack trace.
 *
 * @returns The filename of the caller, or undefined if unknown.
 */
function determineCallerFile(): string | undefined {
  const stack = new Error().stack;
  if (!stack) {
    return undefined;
  }

  const lines = stack.split("\n");
  // Stack format: Error line, determineCallerFile, log function, actual caller at index 3
  const callerLine = lines[3];
  if (!callerLine) {
    return undefined;
  }

  const match = callerLine.match(/\/([^/]+\.ts)/);
  return match ? match[1] : undefined;
}

/**
 * Builds a formatted run identifier string.
 *
 * @param runIdentifier Optional run identifier containing scenarioIndex and iteration.
 * @returns Formatted run identifier string without brackets.
 */
function buildRunIdentifier(runIdentifier: Partial<RunIdentifier> = {}): string | undefined {
  let { scenarioIndex: scenario, iteration } = runIdentifier;

  if (scenario === undefined && iteration === undefined) {
    return undefined;
  }

  const scenarioPart = scenario === undefined ? "" : `S${String(scenario).padStart(2, "0")}`;
  const iterationPart = iteration === undefined ? "" : `I${String(iteration).padStart(2, "0")}`;

  return `${scenarioPart}${iterationPart}`;
}

/**
 * Logs a message to stderr with optional scenario and iteration numbers.
 *
 * @param message The message to log.
 * @param runIdentifier Optional run identifier.
 */
export function log(message: string, runIdentifier?: Partial<RunIdentifier>): void {
  // Build log components
  const runIdentifierPart = buildRunIdentifier(runIdentifier);
  const timestamp = new Date().toISOString();
  const source = determineCallerFile();

  // Determine color from source file
  const color = source && FILE_COLORS[source] ? COLORS[FILE_COLORS[source]] : FILE_COLORS.none;

  // Build formatted parts with brackets
  let formattedMessage = [
    formatLogPart(timestamp),
    formatLogPart(runIdentifierPart, MAX_RUN_IDENTIFIER_LENGTH),
    formatLogPart(source, MAX_FILENAME_LENGTH),
    message,
  ].join(" ");

  // Log the message to stderr with color
  console.error(`${color}${formattedMessage}${COLORS.none}`);
}
