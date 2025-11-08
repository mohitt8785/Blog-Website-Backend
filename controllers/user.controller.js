import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

let saltRounds = parseInt(process.env.SALTROUNDS) || 10;

// ✅ REGISTER CONTROLLER
export async function handleUserRegister(req, res) {
    try {
        const { fullname, username, email, password } = req.body;

        // Validation
        if (!fullname || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check existing user
        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists with this username or email",
            });
        }

        // Hash password
        const hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const newUser = await User.create({
            fullname,
            username,
            email,
            password: hash,
        });

        // Remove password before sending response
        const userSafe = newUser.toObject();
        delete userSafe.password;

        return res
            .status(201)
            .json({ message: "User created successfully", user: userSafe });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ✅ LOGIN CONTROLLER
export async function handleUserLogin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const singleUser = await User.findOne({ email });
        if (!singleUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(password, singleUser.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Tokens
        const accessToken = jwt.sign(
            { id: singleUser._id, email: singleUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        const refreshToken = jwt.sign(
            { id: singleUser._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // Cookies
        const cookieOptions = {
            maxAge: 2 * 60 * 60 * 1000, // 2 hrs
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        };

        res.cookie("userToken", accessToken, cookieOptions);
        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        const userSafe = singleUser.toObject();
        delete userSafe.password;

        return res
            .status(200)
            .json({ message: "Login successful", user: userSafe, accessToken, refreshToken });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ✅ LOGOUT CONTROLLER
export async function handleUserLogout(req, res) {
    try {
        res.clearCookie("userToken", { path: "/" });
        res.clearCookie("refreshToken", { path: "/" });

        return res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
