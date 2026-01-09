#!/usr/bin/env bun

import { evaluateScenario } from "./evaluate-scenario";
import { log } from "./log";
import { ScenarioSchema } from "./schema";
import type { Scenario, ScenarioEvaluationResult } from "./types";
import { readFile } from "fs/promises";
import { dedent } from "ts-dedent";
import { parseArgs } from "util";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const DEFAULT_ITERATIONS = 3;

const OptionsSchema = z.object({
  yamlFile: z.string().describe("Path to the YAML file containing test scenarios"),
  iterations: z.coerce
    .number()
    .default(DEFAULT_ITERATIONS)
    .describe("Number of times to run each scenario"),
  scenarios: z.array(z.coerce.number()).optional().describe("Specific scenario indices to run"),
});

type Arguments = z.infer<typeof OptionsSchema>;

const HELP_TEXT = dedent`
  Usage: evaluate-skill --yamlFile <file> [OPTIONS]

  Runs all test scenarios from a SKILL.test.yml file and summarizes the results.

  Required Arguments:

    --yamlFile <file>        Path to the YAML file containing test scenarios

  Options:

    --iterations <number>    Number of times to run each scenario (default: ${DEFAULT_ITERATIONS})
    --scenario <number>      Run specific scenario index (can be specified multiple times)
    --help                   Displays the usage information.

  Examples:

    evaluate-skill --yamlFile SKILL.test.yml
    evaluate-skill --yamlFile SKILL.test.yml --iterations 10
    evaluate-skill --yamlFile SKILL.test.yml --scenario 1 --scenario 3
`;

/**
 * Parses command line arguments into skill evaluation options.
 *
 * @returns The parsed options.
 */
function parseOptions(): z.infer<typeof OptionsSchema> {
  const { values } = parseArgs({
    options: {
      yamlFile: { type: "string" },
      iterations: { type: "string" },
      scenario: { type: "string", multiple: true },
      help: { type: "boolean" },
    },
    strict: true,
  });

  if (values.help) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const result = OptionsSchema.safeParse({
    yamlFile: values.yamlFile,
    iterations: values.iterations,
    scenarios: values.scenario,
  });

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(`Error: Invalid arguments:\n\n${issues}`);
    process.exit(1);
  }

  return result.data;
}

/**
 * Parses the scenarios from the specified YAML file.
 *
 * @param options The skill evaluation options.
 * @returns Tuples containing the scenario and its index.
 */
async function loadScenarios({
  yamlFile,
  scenarios: scenarioIndices,
}: Arguments): Promise<[Scenario, number][]> {
  const content = await readFile(yamlFile, "utf-8");
  const result = z.array(ScenarioSchema).safeParse(parseYaml(content));

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(`Error: Invalid YAML file format:\n\n${issues}`);
    process.exit(1);
  }

  if (scenarioIndices === undefined || scenarioIndices.length === 0) {
    scenarioIndices = result.data.map((_, index) => index);
  }

  return result.data
    .map((scenario, index) => [scenario, index] as [Scenario, number])
    .filter(([_, index]) => scenarioIndices.includes(index));
}

/**
 * Evaluates a scenario multiple times.
 *
 * @param scenario The scenario to evaluate.
 * @param scenarioIndex The index of the scenario.
 * @param iterations The number of times to run the scenario.
 * @returns Array of evaluation results, one per iteration.
 */
async function evaluateScenarioN(
  scenario: Scenario,
  scenarioIndex: number,
  iterations: number,
): Promise<ScenarioEvaluationResult[]> {
  log(`Start (${iterations} iteration${iterations === 1 ? "" : "s"})`, {
    scenarioIndex,
  });

  return Promise.all(
    Array.from({ length: iterations })
      .keys()
      .map((iteration) => evaluateScenario(scenario, { scenarioIndex, iteration })),
  );
}

/**
 * Prints the evaluation results for a scenario.
 *
 * @param scenario The scenario that was evaluated.
 * @param scenarioIndex The index of the scenario.
 * @param results The evaluation results.
 */
function printScenarioEvaluationResults(
  scenario: Scenario,
  scenarioIndex: number,
  results: ScenarioEvaluationResult[],
): void {
  console.log("━".repeat(60));
  console.log(`Scenario ${scenarioIndex}: ${scenario.description}`);
  console.log();

  // Display expected skill
  if (scenario.expectedSkill) {
    const invokedCount = results.filter((result) =>
      result.invokedSkills.has(scenario.expectedSkill!),
    ).length;
    const percentage = Math.round((invokedCount / results.length) * 100);
    const paddedSkill = scenario.expectedSkill.padEnd(40);
    console.log(`Expected Skill:`);
    console.log(`  · ${paddedSkill} ${percentage}% (${invokedCount}/${results.length})`);
    console.log();
  }

  // Display expected result
  if (scenario.expectedResult) {
    const resultsWithExpectations = results.filter((result) => "success" in result);
    const passed = resultsWithExpectations.filter((result) => result.success).length;
    const failed = resultsWithExpectations.length - passed;

    console.log(`Expected Result: ${scenario.expectedResult}`);
    if (passed > 0) {
      console.log(`  ✔ ${passed} passed`);
    }
    if (failed > 0) {
      console.log(`  ✗ ${failed} failed`);

      // Show failure explanations
      resultsWithExpectations.forEach((result, index) => {
        if (!result.success) {
          console.log(`     Iteration ${index}: ${result.explanation}`);
        }
      });
    }
    console.log();
  }
}

// Load the scenarios
let options = parseOptions();
let scenarios = await loadScenarios(options);

// Evaluate all scenarios
for (const [scenario, scenarioIndex] of scenarios) {
  let results = await evaluateScenarioN(scenario, scenarioIndex, options.iterations);
  printScenarioEvaluationResults(scenario, scenarioIndex, results);
}
