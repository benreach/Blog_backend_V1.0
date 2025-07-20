import Joi from 'joi';

export const updateUserSchema = Joi.object({
    userId: Joi.string().uuid().required(),
  firstName: Joi.string().min(1).max(50).optional().allow(null, ''),
  lastName: Joi.string().min(1).max(50).optional().allow(null, ''),
  displayName: Joi.string().min(1).max(50).optional().allow(null, ''),
  birthDate: Joi.date().iso().optional().allow(null),
  profileIcon: Joi.string().uri().optional().allow(null, ''),
  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional().allow(null, ''),
  userType: Joi.string()
    .valid('STUDENT', 'TEACHER', 'VISITOR', 'WORKER', 'USER', 'ADMIN')
    .optional()
    .allow(null, ''),
}).min(1);
