// controllers/userController.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Register User
export const registerUser = async (req, res) => {
  const { displayName, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        displayName,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Sign JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        email: true,
        profileIcon: true,
        gender: true,
        status: true,
        userType: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// Update user information
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const {
    firstName,
    lastName,
    displayName,
    birthDate,
    profileIcon,
    gender,
    userType,
  } = req.body;

  try {
    // Fetch user first
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Check if user updated within the past 7 days
    if (user.lastProfileUpdate) {
      const nextAllowedDate = dayjs(user.lastProfileUpdate).add(7, 'day');
      if (dayjs().isBefore(nextAllowedDate)) {
        return res.status(400).json({
          message: `អ្នកអាចធ្វើកំណែបានម្តងក្នុងមួយសប្តាហ៏។ កំណែរពេលក្រោយនៅ: ${nextAllowedDate.format('YYYY-MM-DD')}`,
        });
      }
    }

    // Proceed to update user and set lastProfileUpdate to now
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        displayName,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        profileIcon,
        gender,
        userType,
        lastProfileUpdate: new Date(),
      },
    });

    res.json({
      message: 'User updated successfully.',
      user: updatedUser,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update user',
      error: error.message,
    });
  }
};
