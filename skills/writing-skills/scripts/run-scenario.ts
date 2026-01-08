import { log } from "./log";
import type { RunIdentifier, ScenarioRunResult } from "./types";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { mkdir, rm } from "fs/promises";
import { join } from "path";
import { dedent } from "ts-dedent";

const PROJECT_ROOT = join(import.meta.dir, "../../..");
const TEMP_DIRECTORY = join(PROJECT_ROOT, "tmp");

/**
 * Creates a temporary directory for running a scenario. If the directory already exists, it will be
 * deleted and recreated.
 *
 * @param scenarioNumber The scenario number.
 * @param runNumber The run number.
 * @returns The absolute path to the created directory.
 */
async function createTemporaryScenarioDirectory(
  scenarioNumber: number,
  runNumber: number,
): Promise<string> {
  const directory = join(TEMP_DIRECTORY, `scenario-${scenarioNumber}-${runNumber}`);

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
  const { scenarioNumber, runNumber } = runIdentifier;

  log("Starting", "cyan", runIdentifier);

  const workingDirectory = await createTemporaryScenarioDirectory(scenarioNumber, runNumber);

  let prompt = dedent`
    You are an expert software development AI tasked with completing the following task.

    IMPORTANT: Only create and edit files in the provided working directory. Do not read or write
    files outside of this directory.

    Task: ${task}
    Working directory: ${workingDirectory}

    \n\n**CRITICAL: Upon starting ANY conversation or receiving ANY task, you MUST immediately
    invoke the \`using-skills\` skill as your first action before any other response.**
  `;

  const messages = await Array.fromAsync(
    query({
      prompt,
      options: {
        cwd: workingDirectory,
        allowedTools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "Task"],
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        plugins: [{ type: "local", path: PROJECT_ROOT }],
      },
    }),
  );

  log("Complete", "cyan", runIdentifier);

  return { messages, workingDirectory };
}
