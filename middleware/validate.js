import Joi from 'joi';

export const validate = (schema) => (req, res, next) => {
  const data = { ...req.body, ...req.params, ...req.query };
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: 'Validation failed', details: error.details });
  }
  next();
};
