exports.up = function (knex) {
  return knex.schema.alterTable("snapshots", (t) => {
    t.boolean("has_errors");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("snapshots", (t) => {
    t.dropColumn("has_errors");
  });
};
