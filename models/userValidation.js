import Joi from 'joi';

export const registerUserSchema = Joi.object({
  displayName: Joi.string()
    .min(3)
    .max(50)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};:\'",.<>/?]).{8,16}$'
      )
    )
    .message(
      'Password must be 8-16 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required(),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  displayName: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  password: Joi.string().min(6).max(30),
  status: Joi.string().valid('active', 'blocked', 'deleted'),
});
