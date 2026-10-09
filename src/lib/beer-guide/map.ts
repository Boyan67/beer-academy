import { MAP_DATA } from "@/lib/beer-guide/map-data";

export type MapRegion = keyof typeof MAP_DATA;

/** The same Mercator projection the generator fitted, so pins land on the outline. */
export function project(region: MapRegion, lat: number, lon: number): [x: number, y: number] {
  const { scale, translate } = MAP_DATA[region];
  const rad = Math.PI / 180;
  return [translate[0] + scale * lon * rad, translate[1] - scale * Math.log(Math.tan(Math.PI / 4 + (lat * rad) / 2))];
}
