/**
 * Map tile source.
 *
 * - With an ArcGIS Location Platform API key (VITE_ARCGIS_API_KEY), we use
 *   Esri's Static Basemap Tiles "Streets" style: English place names and a
 *   licence that allows commercial / ad-supported sites (free tier, then
 *   pay-as-you-go). Restrict the key to your site's domain in the ArcGIS
 *   dashboard, because it ships in the browser bundle.
 * - Without a key (e.g. local development), we fall back to the standard
 *   OpenStreetMap tiles, which are fine for light, non-commercial use.
 */
export interface TileSource {
  url: string;
  attribution: string;
  maxZoom: number;
}

const ESRI_STREETS =
  'https://static-map-tiles-api.arcgis.com/arcgis/rest/services/static-basemap-tiles-service/v1/arcgis/streets/static/tile/{z}/{y}/{x}';

const apiKey = (import.meta.env.VITE_ARCGIS_API_KEY ?? '').trim();

export const usingEsri = apiKey.length > 0;

export const tileSource: TileSource = usingEsri
  ? {
      url: `${ESRI_STREETS}?token=${encodeURIComponent(apiKey)}`,
      attribution:
        // Wording from the service metadata (copyrightText); Esri requires both parts.
        'Powered by <a href="https://www.esri.com">Esri</a> | Sources: Esri, TomTom, Garmin, FAO, NOAA, USGS, &copy; OpenStreetMap contributors, and the GIS User Community',
      maxZoom: 19,
    }
  : {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    };
