exports.seed = function (knex) {
  return knex("gyms").insert([
    { name: "BFF Climb", slug: "bff" },
    { name: "b8a", slug: "b8a" },
    { name: "boruda", slug: "boruda" },
    { name: "BM Downtown", slug: "boulder-movement-downtown" },
    { name: "BM Rochor", slug: "boulder-movement-rochor" },
    { name: "BM Tai Seng", slug: "boulder-movement-tai-seng" },
    { name: "Boulder Planet", slug: "boulder-planet" },
    { name: "Boulder World", slug: "boulder-world" },
    { name: "Boulder+", slug: "boulder-plus" },
    { name: "Fit Bloc", slug: "fitbloc" },
    { name: "OYEYO", slug: "oyeyo" },
    { name: "The Rock School", slug: "the-rock-school" },
    { name: "Z-Vertigo", slug: "z-vertigo" },
    // { name: "Lighthouse", slug: "lighthouse" },
  ]);
};
