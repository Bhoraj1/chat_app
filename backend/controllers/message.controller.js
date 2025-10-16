import { db } from "../config/db.connect.js";
import { processImage } from "../lib/imageProcessor.js";
import { deleteFile } from "../lib/fileHelper.js";
export const getUsers = async (req, res, next) => {
  const currentUserId = req.user.id;

  try {
    const [users] = await db.execute(
      "SELECT id, fullName, email, profilePic FROM users WHERE id != ?",
      [currentUserId]
    );

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user.id;

    const [messages] = await db.execute(
      "SELECT * FROM messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY created_at ASC",
      [myId, userToChatId, userToChatId, myId]
    );

    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  const { text } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user.id;
  let imgUrl = null;

  try {
    if (req.file) {
      imgUrl = await processImage(req.file, "message");
    }

    const [result] = await db.execute(
      "INSERT INTO messages (senderId, receiverId, text, image) VALUES (?, ?, ?, ?)",
      [senderId, receiverId, text || null, imgUrl]
    );

    const [message] = await db.execute(
      "SELECT * FROM messages WHERE id = ? LIMIT 1",
      [result.insertId]
    );

    res.status(201).json({ message: message[0] });
  } catch (error) {
    await deleteFile(imgUrl);
    next(error);
  }
};
