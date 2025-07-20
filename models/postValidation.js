import Joi from "joi";

export const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  category: Joi.string().valid("MUSIC", "NOVEL").required(),
  contentUrl: Joi.string().uri().required(),
});

export const updatePostSchema = Joi.object({
  id: Joi.string().uuid(),
  title: Joi.string().min(3).max(100),
  category: Joi.string().valid("MUSIC", "NOVEL"),
  contentUrl: Joi.string().uri(),
});
