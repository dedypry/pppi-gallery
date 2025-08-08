const  Knex = require("knex");
const { Model } = require("objection");
const knexfile = require("../knexfile");

const config = Knex(knexfile)
Model.knex(config)
class FileModel extends Model {
  static get tableName() {
    return "files";
  }
}

module.exports = FileModel