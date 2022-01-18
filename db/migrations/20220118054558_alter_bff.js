exports.up = async function (knex) {
  await knex("gyms").where({ slug: "bff" }).update({
    slug: "bff-bukit-timah",
    name: "BFF Bukit Timah",
    booking_url: "https://bffclimb.perfectgym.com/clientportal2/#/Login",
  });
  await knex("gyms").insert([
    {
      slug: "bff-bendemeer",
      name: "BFF Bendemeer",
      website_url: "https://bffclimb.com/",
      booking_url: "https://bffclimb.perfectgym.com/clientportal2/#/Login",
    },
  ]);
  return;
};

exports.down = async function (knex) {
  await knex("gyms").where("slug", "bff-bendemeer").del();
  await knex("gyms").where("slug", "bff-bukit-timah").update("slug", "bff");
  return;
};
