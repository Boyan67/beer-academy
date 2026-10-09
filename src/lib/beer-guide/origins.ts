import type { MapRegion } from "@/lib/beer-guide/map";

/** Where a style was born — the pin on its map. */
export type Origin = {
  place: string;
  /** Name as Natural Earth spells it; that country gets shaded. */
  country: string;
  region: MapRegion;
  lat: number;
  lon: number;
};

const eu = (place: string, country: string, lat: number, lon: number): Origin => ({ place, country, region: "europe", lat, lon });
const us = (place: string, lat: number, lon: number): Origin => ({ place, country: "United States of America", region: "usa", lat, lon });

export const ORIGINS: Record<string, Origin> = {
  weissbier: eu("Бавария", "Germany", 48.92, 11.87),
  witbier: eu("Хугарден", "Belgium", 50.78, 4.84),
  "berliner-weisse": eu("Берлин", "Germany", 52.52, 13.4),
  gose: eu("Гослар", "Germany", 51.91, 10.43),
  "american-pale-ale": us("Чико, Калифорния", 39.73, -121.84),
  "american-ipa": us("Западното крайбрежие", 37.8, -122.27),
  "german-pils": eu("Германия", "Germany", 51.2, 9.6),
  "czech-premium-pale-lager": eu("Пилзен", "Czechia", 49.75, 13.38),
  "munich-helles": eu("Мюнхен", "Germany", 48.14, 11.58),
  "vienna-lager": eu("Швехат, Виена", "Austria", 48.14, 16.47),
  marzen: eu("Мюнхен", "Germany", 48.14, 11.58),
  rauchbier: eu("Бамберг", "Germany", 49.89, 10.89),
  schwarzbier: eu("Кьостриц, Тюрингия", "Germany", 50.93, 12.01),
  "munich-dunkel": eu("Мюнхен", "Germany", 48.14, 11.58),
  doppelbock: eu("Мюнхен", "Germany", 48.14, 11.58),
  "baltic-porter": eu("Балтийско крайбрежие", "Poland", 54.35, 18.65),
  "english-porter": eu("Лондон", "United Kingdom", 51.51, -0.13),
  "irish-stout": eu("Дъблин", "Ireland", 53.35, -6.26),
  "imperial-stout": eu("Лондон", "United Kingdom", 51.51, -0.13),
  "best-bitter": eu("Англия", "United Kingdom", 52.5, -1.5),
  "british-strong-ale": eu("Бъртън на Трент", "United Kingdom", 52.8, -1.63),
  "belgian-pale-ale": eu("Белгия", "Belgium", 51.22, 4.4),
  "belgian-dubbel": eu("Вестмале", "Belgium", 51.28, 4.66),
  "belgian-tripel": eu("Вестмале", "Belgium", 51.28, 4.66),
  saison: eu("Валония", "Belgium", 50.45, 3.95),
  "irish-red-ale": eu("Килкени", "Ireland", 52.65, -7.25),
  "hazy-ipa": us("Върмонт", 44.34, -72.76),
  kolsch: eu("Кьолн", "Germany", 50.94, 6.96),
};
