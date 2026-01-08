import type { ScenarioSchema } from "./schema";
import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { z } from "zod";

/** A test scenario for evaluating skill behavior. */
export type Scenario = z.infer<typeof ScenarioSchema>;

/** Identifies a specific scenario evaluation run. */
export type RunIdentifier = {
  /** The scenario index (0-indexed). */
  scenarioIndex: number;
  /** The iteration number for this scenario (0-indexed). */
  iteration: number;
};

/** The raw result from running a scenario. */
export type ScenarioRunResult = {
  /** Full conversation messages from the agent SDK. */
  messages: SDKMessage[];
  /** The working directory where the scenario was executed. */
  workingDirectory: string;
};

/** Evaluation result for a scenario with an expectation. */
export type ScenarioEvaluationWithExpectation = {
  /** Set of skills that were invoked during the run. */
  invokedSkills: Set<string>;
  /** Whether the scenario passed evaluation. */
  success: boolean;
  /** LLM-as-judge's explanation of the evaluation. */
  explanation: string;
};

/** Evaluation result for a scenario without an expectation. */
export type ScenarioEvaluationWithoutExpectation = {
  /** Set of skills that were invoked during the run. */
  invokedSkills: Set<string>;
  success?: never;
  explanation?: never;
};

/** The evaluation result after analyzing a scenario run. */
export type ScenarioEvaluationResult =
  | ScenarioEvaluationWithExpectation
  | ScenarioEvaluationWithoutExpectation;
