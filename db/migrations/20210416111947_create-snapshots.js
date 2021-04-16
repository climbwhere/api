exports.up = (knex) => {
  return knex.schema.createTable("snapshots", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.integer("spaces").notNullable();
    t.datetime("created_at").notNullable().defaultTo("now()");
    t.uuid("session_id").references("sessions.id").notNullable();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable("sessions");
};
