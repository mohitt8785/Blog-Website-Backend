import express from "express";
import {
  handleUserRegister,
  handleUserLogin,
  handleUserLogout,
} from "../controllers/user.controller.js";

const router = express.Router();

// ✅ User Registration
router.post("/register", handleUserRegister);

// ✅ User Login
router.post("/login", handleUserLogin);

// ✅ User Logout
router.get("/logout", handleUserLogout);

export default router;
