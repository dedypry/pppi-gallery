const FileModel = require("../models/file-model");

async function saveToDatabase(body){
    await FileModel.query().insert(body)
}

module.exports = {
    saveToDatabase
}