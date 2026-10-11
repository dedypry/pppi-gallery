require("dotenv/config");
const FileModel = require("../models/file-model");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
const { fileTypeFromBuffer } = require("file-type");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const WEBP_QUALITY = 80;

async function saveToDatabase(body) {
  await FileModel.query().insert(body);
}

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) =>
      error ? reject(error) : resolve(result)
    );
    stream.end(buffer);
  });
}

function getPublicIdFromUrl(url) {
  const { pathname } = new URL(url);
  const match = pathname.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  if (!match) return null;
  return decodeURIComponent(match[1]).replace(/\.[^/.]+$/, "");
}

async function deleteFile(url) {
  await FileModel.query().where("url", url).delete();

  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

async function saveFile(file, folder = "general") {
  const type = await fileTypeFromBuffer(file.buffer);

  if (!type || !IMAGE_MIMES.includes(type.mime)) {
    throw { message: "Unsupported file type" };
  }

  const webpBuffer = await sharp(file.buffer)
    .rotate()
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const result = await uploadBuffer(webpBuffer, {
    folder: folder || "general",
    resource_type: "image",
    format: "webp",
  });

  const filename = `${result.public_id.split("/").pop()}.webp`;
  const url = result.secure_url;

  await saveToDatabase({
    name: filename,
    url,
    size: result.bytes,
    extension: "webp",
    mime_type: "image/webp",
  });

  return {
    filename,
    url,
  };
}

module.exports = {
  saveToDatabase,
  deleteFile,
  saveFile,
};
