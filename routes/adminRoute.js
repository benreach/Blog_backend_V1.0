import express from "express";
import { authenticateToken, admin } from "../middleware/auth.js";
import {
  blockUser,
  unblockUser,
  softDeleteUser,
  restoreUser,
  hardDeleteUser,
  updateAdminProfile,
} from "../controllers/adminController.js";
import { adminProfileUpdateSchema } from "../models/adminInfoValidation.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.patch("/block/:userId", authenticateToken, admin, blockUser);
router.patch("/unblock/:userId", authenticateToken, admin, unblockUser);
router.patch("/delete/:userId", authenticateToken, admin, softDeleteUser);
router.patch("/:id/restore", authenticateToken, admin, restoreUser);
router.delete("/:userId", authenticateToken, admin, hardDeleteUser);
router.put(
  "/profile/update",
  authenticateToken,
  admin,
  validate(adminProfileUpdateSchema),
  updateAdminProfile
);

export default router;
