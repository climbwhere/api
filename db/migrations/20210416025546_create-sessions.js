exports.up = (knex) => {
  return knex.schema.createTable("sessions", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.datetime("starts_at").notNullable();
    t.datetime("ends_at").notNullable();
    t.integer("spaces").notNullable();
    t.uuid("gym_id").references("gyms.id").notNullable();
    t.unique(["starts_at", "gym_id"]);
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable("sessions");
};
