const UserModel = require("../models/users");

async function updateStatus() {
    const user = await UserModel.query().whereNotNull('nia')
}