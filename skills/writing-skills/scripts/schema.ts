import { z } from "zod";

export const ScenarioSchema = z
  .object({
    description: z.string().describe("Human-readable description of what this scenario tests"),
    task: z.string().describe("The task prompt to give to the agent"),
    expectedSkills: z
      .array(z.string())
      .default([])
      .describe("List of skills that should be invoked during this scenario"),
    expectedResult: z
      .string()
      .optional()
      .describe("The expected result or behavior from running this scenario"),
  })
  .describe("A test scenario for evaluating skill behavior");
