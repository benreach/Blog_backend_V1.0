import Joi from 'joi';
import { paginationSchema } from './paginationValidation.js';

export const createCommentSchema = Joi.object({
  postId: Joi.string().uuid().required(),
  content: Joi.string().allow('', null),
  // image is handled via multer, no need here
});

export const updateCommentSchema = Joi.object({
  id: Joi.string().uuid().required(),
  content: Joi.string().required(),
});

export const getCommentsSchema = Joi.object({
  postId: Joi.string().uuid().required(),
}).concat(paginationSchema);;
