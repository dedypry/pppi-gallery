const BackgroundModel = require("../models/background-jobs");
const ProfilesModel = require("../models/profiles");
const UserModel = require("../models/users");
const { saveFile } = require("../services/file-service");
const FormData = require('form-data')
const axios = require('axios')

function getDownloadUrl(url) {
  const gdriveRegex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/;
  const match = url.match(gdriveRegex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  return url;
}

async function getImageFromUrl(url, folder = "profiles") {
  if (!url) return null;

  url = getDownloadUrl(url);

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data);
    const fileObj = {
      buffer,
      size: buffer.length,
    };

    const file = await saveFile(fileObj, 'profiles');

    if (file) {
      return file.url;
    }
    return null;
  } catch (error) {
    console.error("ERRORR ===", error);
    return null;
  }
}

async function start() {
  const jobs = await BackgroundModel.query().where("status", "success");

  for (const job of jobs) {
    const email = job.data.user.email;
    const user = await UserModel.query()
      .select("id")
      .findOne("email", email)

      if(user){
        const profile = job.data.profile

         const photo = await getImageFromUrl(profile.photo);
         const member_payment_file = await getImageFromUrl(
           profile.member_payment_file,
           "payment_files"
         );

         await ProfilesModel.query().where("user_id", user.id).update({
           photo,
           member_payment_file,
         });

         console.log("SUCCESS", photo, member_payment_file)
      }
  }

  process.exit(0);
}

start();
