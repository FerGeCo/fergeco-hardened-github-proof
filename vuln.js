// Synthetic, deliberately vulnerable sample for the SAST capability proof.
// Not used by anything; exists only to verify semgrep actually runs in CI.
const { exec } = require("child_process");

function runUserCommand(userInput) {
  // Command injection: attacker-controlled input concatenated into a shell.
  exec("ls " + userInput, (err, stdout) => console.log(stdout));
}

module.exports = { runUserCommand };
