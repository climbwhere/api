exports.up = (knex) => {
  return knex.schema.createTable("snapshots", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.json("data").notNullable();
    t.datetime("created_at").notNullable().defaultTo(knex.raw("now()"));
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable("snapshots");
};
