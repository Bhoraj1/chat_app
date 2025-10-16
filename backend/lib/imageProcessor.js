import sharp from "sharp";
import path from "path";

export const processImage = async (file, type = "profile") => {
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;

  const config = {
    profile: {
      folder: "profileImg",
      size: 800,
      quality: 80,
    },
    message: {
      folder: "messageImg",
      size: 1200,
      quality: 85,
    },
  };

  const { folder, size, quality } = config[type];
  const outputPath = path.join("uploads", folder, filename);

  await sharp(file.buffer)
    .resize(size, size, { fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);

  return `${folder}/${filename}`;
};
