const Joi = require('joi');
const { Op } = require('sequelize');
const { Member } = require('../models');

const createSchema = Joi.object({
  first_name: Joi.string().min(1).max(100).required(),
  last_name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().max(20).allow('', null),
  address: Joi.string().max(500).allow('', null),
  membership_date: Joi.date().iso().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
});

const updateSchema = Joi.object({
  first_name: Joi.string().min(1).max(100).optional(),
  last_name: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().allow('', null).optional(),
  phone: Joi.string().max(20).allow('', null).optional(),
  address: Joi.string().max(500).allow('', null).optional(),
  membership_date: Joi.date().iso().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
}).min(1);

async function getMembers(req, res) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
  const offset = (page - 1) * limit;
  const where = {};

  if (req.query.search) {
    where[Op.or] = [
      { first_name: { [Op.like]: `%${req.query.search}%` } },
      { last_name: { [Op.like]: `%${req.query.search}%` } },
      { email: { [Op.like]: `%${req.query.search}%` } },
    ];
  }
  if (req.query.status) where.status = req.query.status;

  const { count, rows } = await Member.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    total: count,
    page,
    totalPages: Math.ceil(count / limit) || 1,
    members: rows,
  });
}

async function createMember(req, res) {
  try {
    const { error, value } = createSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.details[0].message });

    if (!value.membership_date) value.membership_date = new Date().toISOString().split('T')[0];
    if (!value.status) value.status = 'active';

    const member = await Member.create(value);
    return res.status(201).json(member);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    return res.status(500).json({ message: 'Erreur lors de la création du membre' });
  }
}

async function updateMember(req, res) {
  try {
    const { error, value } = updateSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Membre introuvable' });

    await member.update(value);
    return res.status(200).json(member);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    return res.status(500).json({ message: 'Erreur lors de la mise à jour du membre' });
  }
}

async function deleteMember(req, res) {
  const member = await Member.findByPk(req.params.id);
  if (!member) return res.status(404).json({ message: 'Membre introuvable' });
  await member.destroy();
  return res.status(200).json({ message: 'Membre supprimé' });
}

module.exports = { getMembers, createMember, updateMember, deleteMember };

