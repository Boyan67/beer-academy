/** Photos in /public/photos, all from Wikimedia Commons — cropped and resized. */
export const PHOTOS = {
  hopCones: "/photos/hop-cones.jpg",
  hopPellets: "/photos/hop-pellets.jpg",
  yeast: "/photos/yeast.jpg",
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
];
