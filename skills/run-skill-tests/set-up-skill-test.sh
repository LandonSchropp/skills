#!/usr/bin/env bash

# Creates a clean test directory for testing a specific skill and scenario.

set -euo pipefail

if [ "$#" -ne 2 ]; then
	echo "Usage: $0 <skill-name> <scenario-name>"
	exit 1
fi

skill_name="$1"
scenario_name="$2"

# Get the directory where this script is located
script_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(dirname "$(dirname "$script_directory")")"

# Create test directory path
test_directory="${project_root}/tmp/${skill_name}/${scenario_name}"

# Remove existing directory if it exists
if [ -d "$test_directory" ]; then
	rm -rf "$test_directory"
fi

# Create fresh directory
mkdir -p "$test_directory"

# Output the path (so calling code can capture it)
echo "$test_directory"
