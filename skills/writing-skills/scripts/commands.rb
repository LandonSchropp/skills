require 'json'
require 'open3'
require 'timeout'

PROJECT_ROOT = File.expand_path('../..', __dir__)
DEFAULT_TIMEOUT = 120

# Runs a CLI command.
#
# @param command [Array<String>] The command and its arguments to run.
# @param timeout [Integer] The maximum time to allow the command to run (in seconds).
# @param stream_stderr [Boolean] Whether to stream stderr output in real-time.
# @param json [Boolean] Whether to parse stdout as JSON.
# @return [Array<(String, Integer)>] A 2-element array containing the command's stdout and exit
#   status. If json: true, the first element will be the parsed JSON (Hash or Array).
def run_command(command, timeout: DEFAULT_TIMEOUT, stream_stderr: false, json: false)
  begin
    Timeout.timeout(timeout) do
      Open3.popen3(*command) do |stdin, stdout, stderr, wait_thread|
        # Close stdin since we don't send any input to the command
        stdin.close

        # Read stderr in a background thread
        stderr_thread = Thread.new do
          if stream_stderr
            # Stream stderr to the main process's stderr
            stderr.each_line { $stderr.print _1 }
          else
            # Drain stderr but don't print it
            stderr.read
          end
        end

        # Read stdout
        stdout_output = stdout.read

        # Wait for stderr thread to finish
        stderr_thread.join

        # Parse as JSON if requested
        output = json ? JSON.parse(stdout_output) : stdout_output

        # Return output and exit status
        [output, wait_thread.value.exitstatus]
      end
    end
  rescue Timeout::Error
    raise "Command timed out after #{timeout} seconds"
  end
end

# Runs Claude with the given prompt and options.
#
# @param prompt [String] The prompt to send to Claude.
# @param include_plugin [Boolean] Whether to include the plugin directory.
# @param json_schema [Hash, nil] The JSON schema to validate the output against.
# @param stream_stderr [Boolean] Whether to stream stderr output in real-time.
# @return [String, Hash] The raw output from Claude if no JSON schema is provided, or the parsed
# JSON output if a schema is provided.
def run_claude_code(prompt:, include_plugin: true, json_schema: nil, stream_stderr: false)
  if include_plugin
    prompt += <<~INSTRUCTIONS

      **CRITICAL: Upon starting ANY conversation or receiving ANY task, you MUST immediately invoke
      the `using-skills` skill as your first action before any other response.**
    INSTRUCTIONS
  end

  output_format = json_schema ? "json" : "stream-json"

  command = [
    'claude',
    '--dangerously-skip-permissions',
    *(json_schema ? [] : ['--verbose']),
    '--output-format', output_format,
    *(include_plugin ? ['--plugin-dir', PROJECT_ROOT] : []),
    *(json_schema ? ['--json-schema', json_schema.to_json] : []),
    '--print',
    prompt
  ]

  output, exit_status = run_command(command, json: !!json_schema, stream_stderr:)

  if exit_status != 0
    raise "Claude command failed with exit code #{exit_status}"
  end

  json_schema ? output["structured_output"] : output
end
