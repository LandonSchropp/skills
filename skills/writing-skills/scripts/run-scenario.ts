import { log } from "./log";
import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { mkdir, rm } from "fs/promises";
import { join } from "path";
import { dedent } from "ts-dedent";

/** Configuration for running a test scenario. */
export interface ScenarioConfig {
  /** The task prompt to give to the agent. */
  task: string;
  /** The scenario number (for logging and directory naming). */
  scenarioNumber: number;
  /** The run number (for logging and directory naming). */
  runNumber: number;
  /** Whether to enable the plugin (skills) for this run. */
  pluginEnabled: boolean;
}

/** Result from running a test scenario. */
export interface ScenarioResult {
  /** The task that was given to the agent. */
  task: string;
  /** List of skills that were invoked during the run. */
  skills: string[];
  /** Full conversation messages from the agent SDK. */
  messages: SDKMessage[];
  /** The working directory where the scenario was executed. */
  workingDirectory: string;
}

/**
 * Extracts the list of unique skill names that were invoked during a conversation.
 *
 * @param messages The conversation messages from the agent SDK.
 * @returns Array of unique skill names that were invoked.
 */
function extractInvokedSkills(messages: SDKMessage[]): string[] {
  const skills = messages
    .filter((message) => message.type === "assistant")
    .flatMap((message) => message.message.content)
    .filter((content) => content.type === "tool_use" && content.name === "Skill")
    .map((content) => content.input?.skill)
    .filter((skill) => typeof skill === "string");

  return [...new Set(skills)];
}

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
 * @param config The scenario configuration.
 * @returns The scenario result including skills invoked and conversation messages.
 */
export async function runScenario({
  task,
  scenarioNumber,
  runNumber,
  pluginEnabled: enablePlugin,
}: ScenarioConfig): Promise<ScenarioResult> {
  log({ scenarioNumber, runNumber, message: "Starting" });

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
        ...(enablePlugin ? { plugins: [{ type: "local", path: PROJECT_ROOT }] } : {}),
      },
    }),
  );

  const skills = extractInvokedSkills(messages);

  log({ scenarioNumber, runNumber, message: "Complete" });

  return { task, skills, messages, workingDirectory };
}
