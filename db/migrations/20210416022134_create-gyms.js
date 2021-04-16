exports.up = (knex) => {
  return knex.schema.createTable("gyms", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.text("slug").unique().notNullable();
    t.text("name").notNullable();
    t.text("address");
    t.text("phone");
    t.text("email");
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable("gyms");
};
