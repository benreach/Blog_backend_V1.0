// routes/userRoutes.js

import express from 'express';
import { registerUser, loginUser, getAllUsers, updateUser } from '../controllers/userController.js';
import { validate } from '../middleware/validate.js';
import { loginUserSchema, registerUserSchema } from '../models/userValidation.js';
import { updateUserSchema } from '../models/updateUserSchema.js';

const router = express.Router();

router.post('/register',validate(registerUserSchema), registerUser);
router.post('/login',validate(loginUserSchema), loginUser);
router.get('/', getAllUsers);
router.put('/:userId', validate(updateUserSchema),updateUser);


export default router;
