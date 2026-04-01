const Joi = require('joi');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

function formatUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

async function register(req, res) {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.details.map((d) => d.message).join(', ') });

    const { name, email, password } = value;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email déjà utilisé' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user);

    return res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    if (err && err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    return res.status(500).json({ message: 'Erreur lors de l’inscription' });
  }
}

async function login(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.details.map((d) => d.message).join(', ') });

    const { email, password } = value;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const ok = await user.validatePassword(password);
    if (!ok) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const token = generateToken(user);
    return res.status(200).json({ token, user: formatUser(user) });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
}

function profile(req, res) {
  return res.status(200).json(formatUser(req.user));
}

module.exports = { register, login, profile };

