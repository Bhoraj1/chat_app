import bcrypt from "bcryptjs";
import { db } from "../config/db.connect.js";
import { generateToken } from "../lib/utils.js";
import { processImage } from "../lib/imageProcessor.js";
import { deleteFile } from "../lib/fileHelper.js";

export const signup = async (req, res, next) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const [existingUser] = await db.execute(
      "SELECT 1 FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)",
      [fullName, email, hashedPassword]
    );

    const userId = result.insertId;
    generateToken(userId, res);

    res.status(201).json({
      message: "User created successfully",
      user: { id: userId, fullName, email },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [users] = await db.execute(
      "SELECT id, fullName, email, password FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const userId = req.user.id;
  let profilePicPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    // Get current profile pic to delete later
    const [currentUser] = await db.execute(
      "SELECT profilePic FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    
    const oldProfilePic = currentUser[0]?.profilePic;

    profilePicPath = await processImage(req.file);

    await db.execute("UPDATE users SET profilePic = ? WHERE id = ? LIMIT 1", [
      profilePicPath,
      userId,
    ]);

    // Delete old profile pic if it exists
    if (oldProfilePic) {
      await deleteFile(oldProfilePic);
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePic: profilePicPath,
    });
  } catch (error) {
    await deleteFile(profilePicPath);
    next(error);
  }
};

export const checkAuth = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};
