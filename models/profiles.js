const  Knex = require("knex");
const { Model } = require("objection");
const knexfile = require("../knexfile");

const config = Knex(knexfile)
Model.knex(config)
class ProfilesModel extends Model {
  static get tableName() {
    return "profiles";
  }
}

module.exports = ProfilesModel