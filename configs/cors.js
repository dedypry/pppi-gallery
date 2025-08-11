require('dotenv/config')
const allowedOrigins =
  process.env.NODE_END === "production"
    ? [
        "https://dpn-pppi.org",
        "https://admin.dpn-pppi.org",
        "https://api.dpn-pppi.org",
      ]
    : ["http://localhost:5174", "http://localhost:5173"];

module.exports = {
  allowedOrigins,
};
