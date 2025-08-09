require("dotenv/config");
var express = require("express");
const multer = require("multer");
var router = express.Router();
const {
  deleteFile,
  saveFile,
} = require("../services/file-service");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", function (req, res) {
  return res.json({
    message: "Welcome to gallery api",
  });
});

router.post(
  "/multiple",
  upload.array("files", 50),
  async function (req, res) {
    const { folder } = req.query;
    try {
      if (!req.files.length)
        return res.status(404).json({
          message: "No File",
        });

      const urls = [];

      for (const file of req.files) {
        const { url } = await saveFile(file, folder);
        urls.push(url);
      }

      res.json({
        message: "File uploaded successfully",
        urls,
      });
    } catch (error) {

      console.error(error)
      return res.status(400).json({ message: "File validation failed" });
    }
  }
);
/* GET home page. */
router.post("/", upload.single("file"), async function (req, res) {
  const { folder } = req.query;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const {filename, url} = await saveFile(req.file, folder)

    res.json({
      message: "File uploaded successfully",
      filename: filename,
      url,
    });
  } catch (error) {
    return res.status(400).json({ message: "File validation failed" });
  }
});

router.delete("/", async function (req, res) {
  const { url, urls } = req.body;

  try {
    if (url) {
      await deleteFile(url);
    }

    if (urls?.length > 0) {
      for (const it of urls) {
        await deleteFile(it);
      }
    }
    console.log("SUCCESS")
    return res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    return res.status(500).json({ message: "Failed to delete file" });
  }
});

module.exports = router;
