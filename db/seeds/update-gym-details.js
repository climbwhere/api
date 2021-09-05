exports.seed = function (knex) {
  return Promise.all([
    update(knex, {
      slug: "bff",
      address: "896 Dunearn Rd, #02-01D, Singapore 589472",
      phone: "9726 3650",
      email: "contact@bffclimb.com",
    }),
    update(knex, {
      slug: "boulder-movement-downtown",
      address: "6A Shenton Way #B1-03, Downtown Gallery, Singapore 068815",
      phone: "6816 6001",
      email: "ask@boulderm.com",
    }),
    update(knex, {
      slug: "boulder-movement-rochor",
      address: "2 Serangoon Road, #02-12, Tekka Place, Singapore 218227",
      phone: "6993 2100",
      email: "ask@boulderm.com",
    }),
    update(knex, {
      slug: "boulder-movement-tai-seng",
      address: "18 Tai Seng Street #01-09, 18 Tai Seng, Singapore 539775",
      phone: "6974 7769",
      email: "ask@boulderm.com",
    }),
    update(knex, {
      slug: "boulder-planet",
      address:
        "604 Sembawang Road, Sembawang Shopping Centre, #B1, 22/23, 758459",
      phone: "9469 2386",
      email: "info@boulderplanet.sg",
    }),
    update(knex, {
      slug: "boulder-world",
      address:
        "10 Eunos Rd 8, #01-205 SingPost Centre (Enrichment Zone, Singapore 408600",
      phone: "6917 7783",
      email: "climb@boulderworld.com",
    }),
    update(knex, {
      slug: "boulder-plus",
      address: "The Aperia Mall, 12 Kallang Ave, #03-17, Singapore 339511",
      phone: "6282 7530",
      email: "contact@boulderplusclimbing.com",
    }),
    update(knex, {
      slug: "fitbloc",
      address: "87 Science Park Dr, #03-02 The Oasis, Singapore 118260",
      phone: "6612 2046",
    }),
    update(knex, {
      slug: "oyeyo",
      address: "148 Mackenzie Rd, Singapore 228724",
      phone: "6996 2095",
      email: "ask.oyeyo@gmail.com",
    }),
    update(knex, {
      slug: "the-rock-school",
      address: "1 Tampines Walk, #02-81, Singapore 528523",
      phone: "9635 3488",
      email: "climb@therockschool.sg",
    }),
    update(knex, {
      slug: "z-vertigo",
      address: "170 Upper Bukit Timah Rd, #B2-20B, Singapore 588179",
      email: "zvertigobouldergym@gmail.com",
    }),
  ]);
};

function update(knex, gym) {
  return knex("gyms")
    .where({
      slug: gym.slug,
    })
    .update(gym);
}
