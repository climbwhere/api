exports.seed = function (knex) {
  return Promise.all([
    update(knex, {
      slug: "bff",
      website_url: "https://bffclimb.com",
      image_url:
        "https://www.littledayout.com/wp-content/uploads/04-BFF-Climb.jpg",
      booking_url: "https://bffclimb.com/book-boulderzone/",
      map_url:
        "https://www.google.com/maps/place/BFF+Climb/@1.336791,103.7836817,15z/data=!4m2!3m1!1s0x0:0xb6485c3340522ef5?sa=X&ved=2ahUKEwia-9W7w8vyAhVI4nMBHRTfBZwQ_BJ6BAhoEAU",
      instagram_url: "https://www.instagram.com/bffclimb.boulderzone/?hl=en",
    }),
    update(knex, {
      slug: "boulder-movement-downtown",
      website_url: "https://www.boulderm.com",
      image_url:
        "https://images.squarespace-cdn.com/content/v1/5d66611207aca80001561956/1609499025631-EGC2RL5RSVJN9VC8FS6N/Fac+1.jpg?format=1500w",
      booking_url: "https://www.boulderm.com/register",
      map_url:
        "https://www.google.com/maps/place/Boulder+Movement+Downtown/@1.2780668,103.849209,15z/data=!4m2!3m1!1s0x0:0x695123a38192687a?sa=X&ved=2ahUKEwiehIPsw8vyAhU5FbcAHUC7BZwQ_BJ6BAhnEAU",
      instagram_url: "https://www.instagram.com/bouldermovementsg/?hl=en",
    }),
    update(knex, {
      slug: "boulder-movement-rochor",
      website_url: "https://www.boulderm.com",
      image_url:
        "https://images.squarespace-cdn.com/content/v1/5d66611207aca80001561956/1623508652532-WLO8OCRKNJXCTGG55EH4/BoulderMovement3%28TekkaPlace%29%2837of77%29.jpg?format=1500w",
      booking_url: "https://www.boulderm.com/register",
      map_url:
        "https://www.google.com/maps/place/Boulder+Movement+Rochor/@1.3050685,103.8492374,17z/data=!3m1!4b1!4m5!3m4!1s0x31da194b0435e987:0x60cc8da2d4354949!8m2!3d1.3050631!4d103.8514261",
      instagram_url: "https://www.instagram.com/bouldermovementsg/?hl=en",
    }),
    update(knex, {
      slug: "boulder-movement-tai-seng",
      website_url: "https://www.boulderm.com",
      image_url:
        "https://images.squarespace-cdn.com/content/v1/5d66611207aca80001561956/1622349050522-AW6H7RBRCA59X216IZL0/PreviewDay%28Selects%29%281of56%29.jpg?format=1500w",
      booking_url: "https://www.boulderm.com/register",
      map_url:
        "https://www.google.com/maps/place/Boulder+Movement+Tai+Seng/@1.3363912,103.8866552,17z/data=!3m1!4b1!4m5!3m4!1s0x31da17a5825a6add:0x2376677496065772!8m2!3d1.3363858!4d103.8888439",
      instagram_url: "https://www.instagram.com/bouldermovementsg/?hl=en",
    }),
    update(knex, {
      slug: "boulder-planet",
      website_url: "https://www.boulderplanet.sg",
      image_url:
        "https://static.wixstatic.com/media/8b92f2_5205b52bb4c1416788cb4e566412f889~mv2.jpg/v1/fill/w_824,h_910,al_c,q_85,usm_0.66_1.00_0.01/8b92f2_5205b52bb4c1416788cb4e566412f889~mv2.webp",
      booking_url: "https://www.boulderplanet.sg/bookings",
      map_url:
        "https://www.google.com/maps/place/Boulder+Planet/@1.4420229,103.822879,17z/data=!3m1!4b1!4m5!3m4!1s0x31da15a9e0acb4a1:0xf91e6b5f3aca0360!8m2!3d1.4420606!4d103.825188",
      instagram_url: "https://www.instagram.com/boulderplanet.sg/?hl=en",
    }),
    update(knex, {
      slug: "boulder-world",
      website_url: "https://boulderworld.com",
      image_url:
        "https://boulderworld.com/wp-content/uploads/2017/11/27335210_10154921690446862_1694968353_o-1-1024x576.jpg",
      booking_url:
        "https://www.picktime.com/566fe29b-2e46-4a73-ad85-c16bfc64b34b",
      map_url:
        "https://www.google.com/maps/place/Boulder+World/@1.3191144,103.8926248,17z/data=!3m1!4b1!4m5!3m4!1s0x31da1819af1edadd:0x9942976407c527e2!8m2!3d1.319109!4d103.8948135",
      instagram_url: "https://www.instagram.com/boulderworldsg/?hl=en",
    }),
    update(knex, {
      slug: "boulder-plus",
      website_url: "https://www.boulderplusclimbing.com",
      image_url:
        "https://walltopia.com/images/projects/boulderplus/42580221_300701643858582_2333244153237864448_o.jpg",
      booking_url:
        "https://app.rockgympro.com/b/widget/?a=calendar&&widget_guid=f33c8b7f0916487d9af58088967aa62d&random=6125e75d28876&iframeid=&mode=p",
      map_url:
        "https://www.google.com/maps/place/boulder%2B+Gym/@1.3101593,103.8615624,17z/data=!3m1!4b1!4m5!3m4!1s0x31da19a9e07777db:0x9fd4b54932528130!8m2!3d1.3101539!4d103.8637511",
      instagram_url: "https://www.instagram.com/boulder_plus/?hl=en",
    }),
    update(knex, {
      slug: "fitbloc",
      website_url: "http://fitbloc.com",
      image_url:
        "https://fitbloc.com/wp-content/uploads/2020/04/fitbit-high-3-of-23_small-scaled-736x414.jpg",
      booking_url: "https://fitbloc.com/booking/",
      map_url:
        "https://www.google.com/maps/place/Fit+·+Bloc/@1.2878189,103.7883027,17z/data=!3m1!4b1!4m5!3m4!1s0x31da1bdd456b9c99:0xca4dcde53162402c!8m2!3d1.2879238!4d103.7904919",
      instagram_url: "https://www.instagram.com/fitbloc/?hl=en",
    }),
    update(knex, {
      slug: "oyeyo",
      website_url: "https://oyeyoboulderhome.com",
      image_url: "https://media.timeout.com/images/105287825/630/472/image.jpg",
      booking_url: "https://www.picktime.com/oyy",
      map_url:
        "https://www.google.com/maps/place/OYEYO+Boulder+Home/@1.3072302,103.8445395,17z/data=!3m1!4b1!4m5!3m4!1s0x31da19bf96af1327:0x5f723d835985c2bd!8m2!3d1.3072248!4d103.8467282",
      instagram_url: "https://www.instagram.com/oyeyoboulderhome/?hl=en",
    }),
    update(knex, {
      slug: "the-rock-school",
      website_url: "https://www.therockschool.sg",
      image_url:
        "https://images.squarespace-cdn.com/content/v1/561122e8e4b0ece82a6c1f90/1554174346569-HHCNU0PZMTGWFCNA2YPS/TheRockSchool-020-Edit.jpg",
      map_url:
        "https://www.google.com/maps/place/The+Rock+School+-+Our+Tampines+Hub/@1.3540334,103.9381324,17z/data=!3m1!4b1!4m5!3m4!1s0x31da3d71240d609d:0x9151f4e316e9abe!8m2!3d1.354028!4d103.9403211",
      instagram_url: "https://www.instagram.com/therockschool/?hl=en",
    }),
    update(knex, {
      slug: "z-vertigo",
      website_url: "https://zvertigobouldergym.wixsite.com/zvert",
      image_url:
        "https://tallypress.com/wp-content/uploads/2020/11/697d2da4-50ba-4a10-a305-81d2c971921b.jpg",
      booking_url: "https://www.picktime.com/ZVbooking",
      map_url:
        "https://www.google.com/maps/place/Z-Vertigo+Boulder+Gym/@1.3431169,103.7738895,17z/data=!3m1!4b1!4m5!3m4!1s0x31da11bc1be87a75:0xafcd8c11d44c3cd6!8m2!3d1.3430714!4d103.7758633",
      instagram_url: "https://www.instagram.com/zvertigobouldergym/?hl=en",
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
