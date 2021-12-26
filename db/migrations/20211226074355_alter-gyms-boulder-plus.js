exports.up = async function (knex) {
  await knex("gyms")
    .where({ slug: "boulder-plus" })
    .update({ slug: "boulder-plus-aperia", name: "Boulder+ Aperia" });
  await knex("gyms").insert([
    {
      slug: "boulder-plus-chevrons",
      name: "Boulder+ Chevrons",
      website_url: "https://www.boulderplusclimbing.com",
      booking_url:
        "https://app.rockgympro.com/b/widget/?a=calendar&&widget_guid=a316dc1053024e19942cd1dc7f20d1c1&random=61c81c65be434&iframeid=&mode=p",
    },
  ]);

  return;
};

exports.down = async function (knex) {
  await knex("gyms").where("slug", "boulder-plus-chevrons").del();
  await knex("gyms")
    .where("slug", "boulder-plus-aperia")
    .update("slug", "boulder-plus");
  return;
};
