// generateSecret.js
const crypto = require('crypto');

// Generate a random secret key
const secret = crypto.randomBytes(64).toString('hex');

// Print the secret key to the console
console.log(secret);
