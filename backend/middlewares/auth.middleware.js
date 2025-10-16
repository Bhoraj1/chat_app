import jwt from "jsonwebtoken";
import { db } from "../config/db.connect.js";

export const protect = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await db.execute(
      "SELECT id, fullName, email, profilePic, created_at FROM users WHERE id = ? LIMIT 1",
      [decoded.userId]
    );
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user[0];
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
