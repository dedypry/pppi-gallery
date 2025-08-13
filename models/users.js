const Knex = require("knex");
const { Model } = require("objection");
const knexfile = require("../knexfile");
const ProfilesModel = require("./profiles");

const config = Knex(knexfile);
Model.knex(config);
class UserModel extends Model {
  static get tableName() {
    return "users";
  }

  static get relationMappings() {
    return {
      profile: {
        relation: Model.HasOneRelation,
        modelClass: ProfilesModel,
        join: {
          from: "users.id",
          to: "profiles.user_id",
        },
      },
    };
  }
}

module.exports = UserModel;
