/** Photos in /public/photos, from Wikimedia Commons, Flickr and Pixabay — cropped and resized. */
export const PHOTOS = {
  maltHand: "/photos/malt-hand.jpg",
  maltingFloor: "/photos/malting-floor.jpg",
  oastHouses: "/photos/oast-houses.jpg",
  hopYard: "/photos/hop-yard.jpg",
  lagerCellar: "/photos/lager-cellar.jpg",
  foeders: "/photos/foeders.jpg",
  sourBarrels: "/photos/sour-barrels.jpg",
  tapWater: "/photos/tap-water.jpg",
  pilsenGate: "/photos/pilsen-gate.jpg",
  burtonUnion: "/photos/burton-union.jpg",
  clearBottle: "/photos/clear-bottle.jpg",
  oysters: "/photos/oysters.jpg",
  fishAndChips: "/photos/fish-and-chips.jpg",
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
  {
    title: "Покълващ ечемик",
    author: "Chris Allen",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    source: "https://commons.wikimedia.org/wiki/File:Tuckers_Maltings_-_germinating_barley_-_geograph.org.uk_-_2458826.jpg",
  },
  {
    title: "Малцов под в Highland Park",
    author: "Lakeworther",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:Highland_park_malting_floor.jpg",
  },
  {
    title: "Сушилни за хмел в Кент",
    author: "Ray in Manila",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    source: "https://www.flickr.com/photos/21186555@N07/48692043266",
  },
  {
    title: "Хмелна градина в Мейн",
    author: "Allagash Brewing",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    source: "https://www.flickr.com/photos/89562459@N03/14954239630",
  },
  {
    title: "Лагерни бъчви на Pilsner Urquell",
    author: "P.H. Louw",
    license: "CC BY 2.5 NL",
    licenseUrl: "https://creativecommons.org/licenses/by/2.5/nl",
    source: "https://commons.wikimedia.org/wiki/File:PilsnerUrquell03.jpg",
  },
  {
    title: "Фудери в De Garde Brewing",
    author: "Liannadavis",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:DeGardeBrewingFoeders.jpg",
  },
  {
    title: "Бъчви с кисела бира",
    author: "Allagash Brewing",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    source: "https://www.flickr.com/photos/89562459@N03/16944966861",
  },
  {
    title: "Портата на Pilsner Urquell",
    author: "Mister No",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    source: "https://commons.wikimedia.org/wiki/File:Pilsner_Urquell_Brewery_-_panoramio_(2).jpg",
  },
  {
    title: "Системата Burton Union",
    author: "Dave Pickersgill",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Burton_Union_Fermentation_System,_Coors_Visitor_Centre_-_geograph.org.uk_-_761185.jpg",
  },
  {
    title: "Бира в прозрачна бутилка",
    author: "Crinity",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    source: "https://www.flickr.com/photos/11823401@N00/24970629",
  },
  // Pixabay doesn't require credit; listed anyway so every photo's source is here.
  {
    title: "Чешма",
    author: "JonasKIM",
    license: "Pixabay License",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    source: "https://pixabay.com/photos/faucet-sink-tap-tap-water-flow-3240211/",
  },
  {
    title: "Стриди",
    author: "MartinL21",
    license: "Pixabay License",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    source: "https://pixabay.com/photos/fresh-oyster-appetizer-4917758/",
  },
  {
    title: "Риба с пържени картофи",
    author: "Famifranquoi",
    license: "Pixabay License",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    source: "https://pixabay.com/photos/fish-and-chips-scotland-2753360/",
  },
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
