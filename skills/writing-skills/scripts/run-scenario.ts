import { log } from "./log";
import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { mkdir, rm } from "fs/promises";
import { join } from "path";
import { dedent } from "ts-dedent";

export interface ScenarioConfig {
  task: string;
  scenarioNumber: number;
  runNumber: number;
  pluginEnabled: boolean;
}

export interface ScenarioResult {
  task: string;
  skills: string[];
  messages: SDKMessage[];
  workingDirectory: string;
}

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

async function createTemporaryScenarioDirectory(
  scenarioNumber: number,
  runNumber: number,
): Promise<string> {
  const directory = join(TEMP_DIRECTORY, `scenario-${scenarioNumber}-${runNumber}`);

  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });

  return directory;
}

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
