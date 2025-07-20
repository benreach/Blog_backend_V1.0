import Joi from "joi";

export const adminProfileUpdateSchema = Joi.object({
  coverImage: Joi.string().uri().optional(),
  profileIcon: Joi.string().uri().optional(),
  description: Joi.string().optional(),
  facebook: Joi.string().uri().optional(),
  twitter: Joi.string().uri().optional(),
  instagram: Joi.string().uri().optional(),
  youtube: Joi.string().uri().optional(),
  website: Joi.string().uri().optional(),
  linkedIn: Joi.string().uri().optional(),
});
