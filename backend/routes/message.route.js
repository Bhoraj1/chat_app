import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.js";
import {
  getMessages,
  getUsers,
  sendMessage,
} from "../controllers/message.controller.js";

const messageRoutes = express.Router();

messageRoutes.get("/users", protect, getUsers);
messageRoutes.get("/:id", protect, getMessages);
messageRoutes.post("/send/:id", protect, upload.single("image"), sendMessage);

export default messageRoutes;
