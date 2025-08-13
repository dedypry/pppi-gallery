const  Knex = require("knex");
const { Model } = require("objection");
const knexfile = require("../knexfile");

const config = Knex(knexfile)
Model.knex(config)
class UserModel extends Model {
  static get tableName() {
    return "users";
  }
}

module.exports = UserModel