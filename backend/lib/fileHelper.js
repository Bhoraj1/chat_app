import fs from "fs/promises";
import path from "path";

export const deleteFile = async (filePath) => {
  if (!filePath) return;
  
  try {
    await fs.unlink(path.join("uploads", filePath));
  } catch (error) {
    console.error("Failed to delete uploaded file:", error);
  }
};