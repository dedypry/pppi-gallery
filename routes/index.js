require("dotenv/config");
var express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var router = express.Router();
const { fileTypeFromBuffer } = require("file-type");
const { saveToDatabase } = require("../services/file-service");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", function (req, res, next) {
  return res.json({
    message: "Welcome to gallery api",
  });
});

/* GET home page. */
router.post("/", upload.single("file"), async function (req, res, next) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const type = await fileTypeFromBuffer(req.file.buffer);

    if (
      !type ||
      !["image/jpeg", "image/png", "image/webp"].includes(type.mime)
    ) {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    const { folder } = req.query;
    const dir = path.join(__dirname, "..", "public", folder || "");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${
      type.ext
    }`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, req.file.buffer);

    const url = `${process.env.HOST}/${folder}/${filename}`;
    saveToDatabase({
      name: filename,
      url,
      size: req.file.size,
      extension: type.ext,
      mime_type: type.mime,
    });

    res.json({
      message: "File uploaded successfully",
      filename: filename,
      url,
    });
  } catch (error) {
    return res.status(400).json({ message: "File validation failed" });
  }
});

router.delete("/", function (req, res) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    // Ambil path setelah domain, contoh: "/profile/user/namafile.png"
    const parsedUrl = new URL(url);
    const filePathRelative = parsedUrl.pathname; // contoh: /profile/user/xxx.png

    // Gabungkan dengan public
    const filePath = path.join(__dirname, "..", "public", filePathRelative);

    // Cek apakah file ada
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Hapus file
    fs.unlinkSync(filePath);

    return res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    return res.status(500).json({ message: "Failed to delete file" });
  }
});

module.exports = router;
