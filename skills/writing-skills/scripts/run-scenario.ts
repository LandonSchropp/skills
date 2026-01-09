import { runClaudeCode } from "../agent";
import { log } from "./log";
import type { RunIdentifier, ScenarioRunResult } from "./types";
import { mkdir, rm } from "fs/promises";
import { join } from "path";
import { dedent } from "ts-dedent";

const PROJECT_ROOT = join(import.meta.dir, "../../..");
const TEMP_DIRECTORY = join(PROJECT_ROOT, "tmp");

/**
 * Creates a temporary directory for running a scenario. If the directory already exists, it will be
 * deleted and recreated.
 *
 * @param scenarioIndex The scenario index (0-indexed).
 * @param iteration The iteration number (0-indexed).
 * @returns The absolute path to the created directory.
 */
async function createTemporaryScenarioDirectory(
  scenarioIndex: number,
  iteration: number,
): Promise<string> {
  const directory = join(TEMP_DIRECTORY, `scenario-${scenarioIndex}-${iteration}`);

  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });

  return directory;
}

/**
 * Runs a test scenario by spawning an agent with the given task.
 *
 * @param scenario The scenario configuration.
 * @param runIdentifier The run identifier.
 * @returns The scenario run result including conversation messages and working directory.
 */
export async function runScenario(
  scenario: { task: string },
  runIdentifier: RunIdentifier,
): Promise<ScenarioRunResult> {
  const { task } = scenario;
  const { scenarioIndex, iteration } = runIdentifier;

  log("Agent running task", runIdentifier);

  const workingDirectory = await createTemporaryScenarioDirectory(scenarioIndex, iteration);

  let prompt = dedent`
    You are an expert software development AI tasked with completing the following task.

    IMPORTANT: Only create and edit files in the provided working directory. Do not read or write
    files outside of this directory.

    Task: ${task}
    Working directory: ${workingDirectory}

    \n\n**CRITICAL: Upon starting ANY conversation or receiving ANY task, you MUST immediately
    invoke the \`using-skills\` skill as your first action before any other response.**
  `;

  const messages = await runClaudeCode({
    prompt,
    workingDirectory,
    messagesFilename: "run-scenario-messages.json",
  });

  log("Agent completed task", runIdentifier);

  return { messages, workingDirectory };
}
