import { runClaudeCode } from "../agent";
import { log } from "./log";
import { runScenario } from "./run-scenario";
import type {
  RunIdentifier,
  Scenario,
  ScenarioEvaluationResult as ScenarioEvaluation,
  ScenarioEvaluationWithExpectation,
  ScenarioRunResult,
} from "./types";
import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { BetaContentBlock } from "@anthropic-ai/sdk/resources/beta.mjs";
import { join } from "path";
import { dedent } from "ts-dedent";

function extractAssistMessageContents(messages: SDKMessage[]): BetaContentBlock[] {
  return messages
    .filter((message) => message.type === "assistant")
    .flatMap((message) => message.message.content);
}

/**
 * Extracts the skill name from a BetaContentBlock if it represents a skill invocation.
 *
 * @param content The BetaContentBlock to extract the skill name from.
 * @returns The skill name if present (normalized without prefix), or undefined if not.
 */
function extractSkill(content: BetaContentBlock): string | undefined {
  // We use Skill tool uses to detect skill invocations
  if (content.type !== "tool_use" || content.name !== "Skill") {
    return undefined;
  }

  // Because the input for an arbitrary tool is unknown, we have to explicitly check the structure
  if (!content.input || typeof content.input !== "object") {
    return undefined;
  }

  // Extract the skill name
  if (!("skill" in content.input) || typeof content.input.skill !== "string") {
    return undefined;
  }

  // Remove the prefix from the skill name since the evaluation harness shouldn't need to be aware
  // of how the skills are namespaced.
  return content.input.skill.replace(/^.*?:/, "");
}

/**
 * Extracts the set of unique skill names that were invoked during a conversation.
 *
 * @param messages The conversation messages from the agent SDK.
 * @returns Set of unique skill names that were invoked.
 */
function extractInvokedSkills(messages: SDKMessage[]): Set<string> {
  const skills = extractAssistMessageContents(messages)
    .map(extractSkill)
    .filter((skill) => skill !== undefined);

  return new Set(skills);
}

/**
 * Extracts the structured output from the result message in an SDK message array.
 *
 * @param messages The conversation messages from the agent SDK.
 * @returns The structured output object.
 * @throws Error if no result message or structured output is found.
 */
function extractStructuredOutput(messages: SDKMessage[]): unknown {
  const resultMessage = messages.find((msg) => msg.type === "result");

  if (!resultMessage || resultMessage.type !== "result") {
    throw new Error("No result message found in conversation");
  }

  if (!("structured_output" in resultMessage)) {
    throw new Error("No structured_output field found in result message");
  }

  return resultMessage.structured_output;
}

/**
 * Evaluates a scenario by running it and checking if expectations were met.
 *
 * @param scenario The scenario configuration including task and expectations.
 * @param runIdentifier The run identifier.
 * @returns The evaluation result.
 */
export async function evaluateScenario(
  scenario: Scenario,
  runIdentifier: RunIdentifier,
): Promise<ScenarioEvaluation> {
  const { task, expectedResult } = scenario;

  // Run the scenario
  const { messages, workingDirectory }: ScenarioRunResult = await runScenario(
    scenario,
    runIdentifier,
  );

  log("Checking skills", runIdentifier);

  // Extract invoked skills
  const invokedSkills = extractInvokedSkills(messages);

  // If there's no expected result, return simple result
  if (!expectedResult) {
    log("Complete", runIdentifier);

    return { invokedSkills };
  }

  // Write the conversation log for the evaluator
  const conversationLogFile = join(workingDirectory, "run-scenario-messages.json");

  // Run an LLM-as-judge evaluation of the conversation
  const prompt = dedent`
    You are an evaluator that determines whether an AI agent successfully completed an expected
    result.

    Task: ${task}

    Expectation: ${expectedResult}

    Working directory: ${workingDirectory}
    Conversation log: ${conversationLogFile}

    To evaluate the agent's work, you can use these commands for quick inspection:

    \`\`\`bash
    # List files created by the agent
    find ${workingDirectory} -type f -not -path "*/.*" -not -name "*-messages.json"

    # Extract tools used by the agent
    cat ${conversationLogFile} | jq '[.[] | select(.type == "assistant") | .message.content[] | select(.type == "tool_use") | .name] | unique'

    # Extract agent's text messages
    cat ${conversationLogFile} | jq '[.[] | select(.type == "assistant") | .message.content[] | select(.type == "text") | .text]'
    \`\`\`

    You can also read the conversation log file directly if needed, but the commands above are
    faster for most checks.

    Evaluate whether the agent met the expectation. Return:

    - success: true if the expectation was clearly met, false otherwise
    - explanation: Brief (1-2 sentences) explanation of your evaluation

    Be strict—only mark success as true if there is clear evidence that the agent completed the
    expected result.
  `;

  const jsonSchema = {
    type: "object",
    properties: {
      success: { type: "boolean" },
      explanation: { type: "string" },
    },
    required: ["success", "explanation"],
  };

  log("Evaluating result", runIdentifier);

  const evaluationMessages = await runClaudeCode({
    prompt,
    workingDirectory,
    messagesFilename: "evaluate-scenario-messages.json",
    jsonSchema,
  });

  // Extract the structured output from the result message
  // The SDK validates against our schema, so we can safely cast
  const evaluation = extractStructuredOutput(evaluationMessages) as Pick<
    ScenarioEvaluationWithExpectation,
    "success" | "explanation"
  >;

  log("Complete", runIdentifier);

  return {
    invokedSkills: invokedSkills,
    success: evaluation.success,
    explanation: evaluation.explanation,
  };
}
