import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

/** A test scenario for evaluating skill behavior. */
export type Scenario = {
  /** Human-readable description of what this scenario tests. */
  description: string;
  /** The task prompt to give to the agent. */
  task: string;
  /** List of skills that should be invoked during this scenario. */
  expectedSkills: string[];
  /** The expected result or behavior from running this scenario. */
  expectation: string;
};

/** Identifies a specific scenario evaluation run. */
export type RunIdentifier = {
  /** The scenario number (1-indexed). */
  scenarioNumber: number;
  /** The run number for this scenario (1-indexed). */
  runNumber: number;
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
