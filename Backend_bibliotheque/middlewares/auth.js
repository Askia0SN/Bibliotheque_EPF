const jwt = require('jsonwebtoken');
const { User } = require('../models');

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  if (!header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

module.exports = async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Authorization Bearer token requis' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET manquant dans le fichier .env');

    const decoded = jwt.verify(token, secret);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

