const  Knex = require("knex");
const { Model } = require("objection");
const knexfile = require("../knexfile");

const config = Knex(knexfile)
Model.knex(config)
class BackgroundModel extends Model {
  static get tableName() {
    return "background_jobs";
  }
}

module.exports = BackgroundModel