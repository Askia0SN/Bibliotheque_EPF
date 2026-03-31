const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET manquant dans le fichier .env');
  return secret;
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '7d';
}

/**
 * Génère un JWT à partir d’un utilisateur.
 * Le frontend attend l’API: Authorization: Bearer <token>
 */
function generateToken(user) {
  const payload = { id: user.id, email: user.email };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() });
}

module.exports = { generateToken };

