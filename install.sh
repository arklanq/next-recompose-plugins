#!/bin/bash

set -e

export NVM_DIR="$HOME/.nvm"

# Load NVM (Node Version Manager)
if [ -s "$NVM_DIR/nvm.sh" ]; then
  \. "$NVM_DIR/nvm.sh"
else
  echo "⚠️  NVM is not installed or not found at $NVM_DIR."
  echo "Please install NVM first: https://github.com/nvm-sh/nvm"
  exit 1
fi

# List of directories to process
dirs=(
  "."      # root /
  "./lib"  # lib
)

# Add all subdirectories from test-applications
for d in ./test-applications/*/ ; do
  [ -d "$d" ] && dirs+=("$d")
done

# Install dependencies in each directory
for dir in "${dirs[@]}"; do
  echo "Processing \`$dir\` ..."

  (
    cd "$dir"

    if [ -f "package.json" ]; then
      # Read Node.js version from package.json
      node_version=$(jq -r '.engines.node // empty' package.json)

      if [ -n "$node_version" ]; then
        if ! nvm ls "v$node_version" | grep -qw "v$node_version"; then
          echo "Node.js v$node_version not installed. Installing..."
          nvm install "$node_version"
        fi

        echo "Using Node.js v$node_version."
        nvm use "$node_version"

        # Ensure yarn is installed
        if ! command -v yarn > /dev/null 2>&1; then
          echo "Yarn is not installed for Node.js v$node_version. Installing yarn..."
          npm install -g yarn
        fi

        # Install Node.js dependencies
        yarn install
      else
        echo "No \`engines.node\` specified, skipping..."
      fi
    else
      echo "No \`package.json\` found, skipping..."
    fi
  )
done
