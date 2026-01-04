require 'open3'
require 'timeout'

DEFAULT_TIMEOUT = 120

# Runs a CLI command.
#
# @param command [Array<String>] The command and its arguments to run.
# @param timeout [Integer] The maximum time to allow the command to run (in seconds).
# @param stream_stderr [Boolean] Whether to stream stderr output in real-time.
# @return [String, Integer] A tuple containing the command's stdout and exit status.
def run_command(command, timeout: DEFAULT_TIMEOUT, stream_stderr: false)
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

        # Return stdout and exit status
        [stdout_output, wait_thread.value.exitstatus]
      end
    end
  rescue Timeout::Error
    raise "Command timed out after #{timeout} seconds"
  end
end
