# Function to check if a command is available
isCommand() {
  command -v $1 >/dev/null 2>&1;
}