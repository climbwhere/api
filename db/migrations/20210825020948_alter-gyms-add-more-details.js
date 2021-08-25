exports.up = function (knex) {
  return knex.schema.alterTable("gyms", (t) => {
    t.text("website_url");
    t.text("image_url");
    t.text("booking_url");
    t.text("map_url");
    t.text("instagram_url");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("gyms", (t) => {
    t.dropColumn("website_url");
    t.dropColumn("image_url");
    t.dropColumn("booking_url");
    t.dropColumn("map_url");
    t.dropColumn("instagram_url");
  });
};
