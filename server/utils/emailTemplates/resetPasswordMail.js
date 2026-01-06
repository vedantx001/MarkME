module.exports = (link) => `
<h2>Reset your password</h2>
<p>Click the link below to reset your password:</p>
<a href="${link}">${link}</a>
<p>This link is valid for 15 minutes.</p>
`;
