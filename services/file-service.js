const FileModel = require("../models/file-model");
const path = require("path");
const fs = require("fs");
const { fileTypeFromBuffer } = require("file-type");

async function saveToDatabase(body) {
  await FileModel.query().insert(body);
}

async function deleteFile(url) {
    console.log("SERVICE DEL", url)
  try {
    await FileModel.query().where("url", url).delete();
    const parsedUrl = new URL(url);
    const filePathRelative = parsedUrl.pathname;

    const filePath = path.join(__dirname, "..", "public", filePathRelative);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlinkSync(filePath);
  } catch (error) {
    throw error;
  }
}

async function saveFile(file, folder = "general") {
  try {
    const type = await fileTypeFromBuffer(file.buffer);

    if (
      !type ||
      !["image/jpeg", "image/png", "image/webp"].includes(type.mime)
    ) {
      throw { message: "Unsupported file type" };
    }

    const dir = path.join(__dirname, "..", "public", folder || "");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${
      type.ext
    }`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, file.buffer);

    const url = `${process.env.HOST}/${folder}/${filename}`;
    saveToDatabase({
      name: filename,
      url,
      size: file.size,
      extension: type.ext,
      mime_type: type.mime,
    });

    return {
      filename,
      url,
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  saveToDatabase,
  deleteFile,
  saveFile,
};
