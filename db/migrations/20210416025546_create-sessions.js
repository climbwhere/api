exports.up = (knex) => {
  return knex.schema.createTable("sessions", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.datetime("start").unique().notNullable();
    t.datetime("end").notNullable();
    t.integer("spaces").notNullable();
    t.uuid("gym_id").references("gyms.id").notNullable();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable("sessions");
};
