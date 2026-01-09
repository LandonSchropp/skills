/** Utilities for running Claude Code with network isolation */
import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { writeFile } from "fs/promises";
import { join } from "path";

const MAX_TURNS = 20;
const PROJECT_ROOT = new URL("../..", import.meta.url).pathname;

type QueryOptions = NonNullable<Parameters<typeof query>[0]["options"]>;
type JsonSchema = NonNullable<QueryOptions["outputFormat"]>["schema"];

export interface RunClaudeCodeOptions {
  prompt: string;
  workingDirectory: string;
  messagesFilename: string;
  jsonSchema?: JsonSchema;
  disablePlugin?: boolean;
}

/**
 * Run Claude Code in a sandboxed environment with:
 *
 * - Full file system access for the provided working directory
 * - All tools available (The sandbox prevents harmful operations.)
 * - Complete network isolation
 * - No escape hatch (The commands must run in sandbox.)
 * - Automatic permission bypass for testing
 * - This repository enabled as a plugin by default
 *
 * @param options The options for running Claude Code.
 */
export async function runClaudeCode({
  prompt,
  workingDirectory,
  messagesFilename,
  jsonSchema,
  disablePlugin = false,
}: RunClaudeCodeOptions): Promise<SDKMessage[]> {
  // Run the query using the Claude Code Agent SDK
  const messageIterator = query({
    prompt,
    options: {
      cwd: workingDirectory,
      maxTurns: MAX_TURNS,
      pathToClaudeCodeExecutable: "/Users/landon/.local/bin/claude",

      // Output format (only needed when jsonSchema is provided)
      ...(jsonSchema && {
        outputFormat: {
          type: "json_schema" as const,
          schema: jsonSchema,
        },
      }),

      // Plugin configuration
      ...(!disablePlugin && {
        plugins: [{ type: "local" as const, path: PROJECT_ROOT }],
      }),

      // Sandbox configuration
      sandbox: {
        enabled: true,
        autoAllowBashIfSandboxed: true,
        allowUnsandboxedCommands: false, // No escape hatch
        network: {
          allowLocalBinding: false,
          allowAllUnixSockets: false,
          allowUnixSockets: [],
        },
      },

      // Bypass permissions for automated testing
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
    },
  });

  // Extract all messages from the iterator
  const messages = await Array.fromAsync(messageIterator);

  // Write messages to file for debugging
  const messagesFile = join(workingDirectory, messagesFilename);
  await writeFile(messagesFile, JSON.stringify(messages, null, 2));

  // Return all messages
  return messages;
}
