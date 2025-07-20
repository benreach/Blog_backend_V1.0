import Joi from 'joi';

export const saveToPlaylistSchema = Joi.object({
  postId: Joi.string().uuid().required(), // or Joi.string().required() depending on your ID type
});

export const playlistParamSchema = Joi.object({
  postId: Joi.string().uuid().required(),
});
