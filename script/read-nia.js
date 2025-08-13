const fs = require("fs");
const path = require("path");
const { generateAI } = require("../services/ai");
const pdf = require("pdf-parse-new");
const UserModel = require("../models/users");
const { fn } = require("objection");

async function readNia() {
  const users = await UserModel.query().whereNull("nia");

  const userId = []

  for (const user of users) {
    const filePath = path.join(__dirname, `./E-KTA/E-KTA_${user.name}.pdf`);
    if (fs.existsSync(filePath)) {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(pdfBuffer);
      const result = extractNiaAndName(pdfData.text);

      const { nia } = result;

      console.log(nia);
      if (nia) {
        
        try {
          await user.$query().update({
            nia,
            is_active: true,
            approved_at: fn.now(),
          });
        } catch (error) {
            userId.push({
                id: user.id,
                nia: nia
            })
        }
      }
    }
  }

  if(userId.length){
    const sort = getSort() + 1;

    
  }
}

async function createOnUniq(nia, id) {
    const findUniq = await UserModel.query().findOne('nia', nia);

    if(findUniq){
        const sort = getSort()

        nia = await createOnUniq()
    }
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


async function getSort() {
    const {max} = await UserModel.query().max('nia').first()

    const split = max.split('.')
    const sortNumber = Number(split[split.length - 1]);
    console.log(sortNumber)
    return {
        
        sortNumber
    }
}
// readNia();

getSort()