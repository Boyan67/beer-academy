/** Photos in /public/photos, from Wikimedia Commons and Pixabay — cropped and resized. */
export const PHOTOS = {
  hopCones: "/photos/hop-cones.jpg",
  hopPellets: "/photos/hop-pellets.jpg",
  lupulin: "/photos/lupulin.jpg",
  yeast: "/photos/yeast.jpg",
  kveik: "/photos/kveik.jpg",
  pouring: "/photos/pouring.jpg",
  beerCheese: "/photos/beer-cheese.jpg",
  dessert: "/photos/dessert.jpg",
  spicyFood: "/photos/spicy-food.jpg",
  tastingFlight: "/photos/tasting-flight.jpg",
  bottleBrown: "/photos/bottle-brown.jpg",
  bottleOlive: "/photos/bottle-olive.jpg",
  bottleGreen: "/photos/bottle-green.jpg",
  bottleBlue: "/photos/bottle-blue.jpg",
} as const;

export type PhotoCredit = {
  title: string;
  author: string;
  license: string;
  /** Empty for public domain. */
  licenseUrl: string;
  source: string;
};

/** Shown in the profile — CC BY and BY-SA require the author and licence next to the work. */
export const PHOTO_CREDITS: PhotoCredit[] = [
  {
    title: "Шишарки хмел",
    author: "Magdalena Šajinovićová",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:Humulus_lupulus_cones.jpg",
  },
  {
    title: "Хмелови пелети",
    author: "Membeth",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0",
    source: "https://commons.wikimedia.org/wiki/File:Hopfentisch.Pellets.Brauerei.Aying.jpg",
  },
  {
    title: "Мая под микроскоп",
    author: "Masur",
    license: "Обществено достояние",
    licenseUrl: "",
    source: "https://commons.wikimedia.org/wiki/File:S_cerevisiae_under_DIC_microscopy.jpg",
  },
  {
    title: "Дегустационен сет",
    author: "Ruth and Dave",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    source: "https://commons.wikimedia.org/wiki/File:Beer_tasting_flight_at_the_Beer_Farmers.jpg",
  },
  {
    title: "Бирени бутилки",
    author: "George Chernilevsky",
    license: "Обществено достояние",
    licenseUrl: "",
    source: "https://commons.wikimedia.org/wiki/File:Beer_bottles_2018_G1.jpg",
  },
  {
    title: "Лупулин в разрязана шишарка",
    author: "Andrew Kvalheim",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:Lupulin_in_a_cross_section_of_a_hop_cone.jpg",
  },
  {
    title: "Варене с kveik във Вос, Норвегия",
    author: "Anders Flatlandsmo",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Brewing_western_Norway_Farmhuse_Ale_wit_kveik_in_a_traditional_smokehouse_at_Dale_farm,_Voss,_Norway.jpg",
  },
  // Pixabay doesn't require credit; listed anyway so every photo's source is here.
  {
    title: "Наливане на бира",
    author: "Republica",
    license: "Pixabay License",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    source: "https://pixabay.com/photos/beer-pouring-glass-drink-alcohol-820011/",
  },
  {
    title: "Сирене и колбаси",
    author: "stevepb",
    license: "Pixabay License",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    source: "https://pixabay.com/photos/smoked-beef-salami-crackers-cheese-2990990/",
  },
  {
    title: "Стаут и десерт",
    author: "coskun24",
    license: "Pixabay License",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    source: "https://pixabay.com/photos/guinness-beer-sweets-snack-bar-6573283/",
  },
  {
    title: "Тако и бира",
    author: "covertnine",
    license: "Pixabay License",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    source: "https://pixabay.com/photos/tacos-food-mexican-tray-beer-3409675/",
  },
];
