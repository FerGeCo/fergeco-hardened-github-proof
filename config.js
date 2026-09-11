// Synthetic, non-functional, fake credential used ONLY to deterministically
// trigger gitleaks' default AWS-access-key-shaped detection rule for this
// capability proof. Not a real credential; do not report/rotate.
const awsAccessKeyId = "AKIAABCDEFGHIJKLMNOP";
module.exports = { awsAccessKeyId };
