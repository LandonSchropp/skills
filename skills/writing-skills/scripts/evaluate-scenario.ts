import { log } from "./log";
import { runScenario } from "./run-scenario";
import type {
  RunIdentifier,
  Scenario,
  ScenarioEvaluationResult as ScenarioEvaluation,
  ScenarioEvaluationWithExpectation,
  ScenarioRunResult,
} from "./types";
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { BetaContentBlock } from "@anthropic-ai/sdk/resources/beta.mjs";
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
 * @returns The skill name if present, or undefined if not.
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

  return content.input.skill;
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
  const { task, expectation } = scenario;

  log("Running scenario", "blue", runIdentifier);

  // Run the scenario
  const { messages, workingDirectory }: ScenarioRunResult = await runScenario(
    scenario,
    runIdentifier,
  );

  log("Extracting skills from scenario", "blue", runIdentifier);

  // Extract invoked skills
  const invokedSkills = extractInvokedSkills(messages);

  // If there's no expectation, return simple result
  if (!expectation) {
    log("Completed scenario evaluation without expectation", "blue", runIdentifier);

    return { invokedSkills };
  }

  // Run an LLM-as-judge evaluation of the conversation
  const evaluationPrompt = dedent`
    You are an evaluator that determines whether an AI agent successfully completed an expected
    result.

    Task: ${task}

    Expectation: ${expectation}

    Conversation:

    ${JSON.stringify(messages, null, 2)}

    Evaluate whether the agent met the expectation based on the conversation. Return:

    - success: true if the expectation was clearly met, false otherwise
    - explanation: Brief (1-2 sentences) explanation of your evaluation

    Be strict—only mark success as true if there is clear evidence in the conversation that the
    agent completed the expected result.
  `;

  const schema = {
    type: "object",
    properties: {
      success: { type: "boolean" },
      explanation: { type: "string" },
    },
    required: ["success", "explanation"],
  };

  log("Evaluating scenario with LLM-as-judge", "blue", runIdentifier);

  const evaluationMessages = await Array.fromAsync(
    query({
      prompt: evaluationPrompt,
      options: {
        cwd: workingDirectory,
        outputFormat: {
          type: "json_schema",
          schema,
        },
      },
    }),
  );

  // Extract the structured output from the result message
  // The SDK validates against our schema, so we can safely cast
  const evaluation = extractStructuredOutput(evaluationMessages) as Pick<
    ScenarioEvaluationWithExpectation,
    "success" | "explanation"
  >;

  log("Completed scenario evaluation", "blue", runIdentifier);

  return {
    invokedSkills: invokedSkills,
    success: evaluation.success,
    explanation: evaluation.explanation,
  };
}
