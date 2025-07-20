import Joi from "joi";

// Banner Create Schema
export const createBannerSchema = Joi.object({
  title: Joi.string().max(255).optional().allow(""),
  linkUrl: Joi.string().uri().optional().allow(""),
});

// Banner Update Schema
export const updateBannerSchema = Joi.object({
    id: Joi.string().uuid(),
  title: Joi.string().max(255).optional().allow(""),
  linkUrl: Joi.string().uri().optional().allow(""),
});
