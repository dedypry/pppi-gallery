const fs = require("fs");
const path = require("path");
const { generateAI } = require("../services/ai");
const pdf = require("pdf-parse-new");
const UserModel = require("../models/users");
const { fn } = require("objection");

async function readNia() {
  const users = await UserModel.query();

  const userId = [];

  for (const user of users) {
    const filePath = path.join(__dirname, `./E-KTA/E-KTA_${user.name.toUpperCase()}.pdf`);
    if (fs.existsSync(filePath)) {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(pdfBuffer);
      const result = extractNiaAndName(pdfData.text);

      const { nia } = result;

      console.log("NIA PDF",nia, result, user.name);
      if (nia) {
        try {
          await user.$query().update({
            nia,
            is_active: true,
            approved_at: fn.now(),
            status: "approved"
          });
        } catch (error) {
          userId.push({
            id: user.id,
            nia: nia,
          });
        }
      }
    }
  }

  if (userId.length) {
    for (const item of userId) {
      await createOnUniq(item.nia, item.id);
    }
  }
}

async function createOnUniq(nia, id) {
  const findUniq = await UserModel.query().findOne("nia", nia);

  if (findUniq) {
    const sort = await getSort();

    nia = nia.split(".").slice(0, 3).join(".") + "." + sort;
  }

  await UserModel.query().findById(id).update({
    nia,
  });
  console.log("SUCCESS", nia)
}

function extractNiaAndName(text) {
  // Cari NIA: format angka dengan titik
  const niaMatch = text.match(/(\d{2}\.\d{2}\.\d{2}\.\d{5})/);

  // Cari nama: ambil baris setelah NIA
  let name = null;
  if (niaMatch) {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const niaIndex = lines.findIndex((line) => line.includes(niaMatch[0]));
    if (niaIndex !== -1 && lines[niaIndex + 3]) {
      name = lines[niaIndex + 3].trim();
    }
  }

  return {
    nia: niaMatch ? niaMatch[0] : null,
    name: name,
  };
}

async function getSort(plus = 1) {
  const { max } = await UserModel.query().max("nia").first();

  const split = max.split(".");
  const sortNumber = Number(split[split.length - 1]) + plus;
  const shortNia = split.slice(0, -1).join(".");
  return String(sortNumber).padStart(4, "0");
}
readNia();

// getSort();

// createOnUniq("30.23.26.00181", 1);
