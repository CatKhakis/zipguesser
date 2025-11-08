import printMe from './print.js';

import './style.css';
import "ol/ol.css";

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';

import {useGeographic} from 'ol/proj.js';

import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import Text from 'ol/style/Text.js';


const zipServerUrl = `https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/census_zip_code_tab_areas_ogc/OGCFeatureServer/api/collections/0/items`;
const params = `f=application/geo+json&limit=1000`;

const lakeStyle = {
  'fill-color': 'rgba(70, 130, 180, 0.6)',
  'stroke-color': 'rgba(25, 25, 112, 1)',
  'stroke-width': 2,
};

useGeographic();

const labelStyle = new Style({
  text: new Text({
    font: '13px Calibri,sans-serif',
    fill: new Fill({
      color: '#000',
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 4,
    }),
  }),
});
const countryStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)',
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1,
  }),
});
const style = [countryStyle, labelStyle];

const layer = new VectorLayer({
  style: lakeStyle,
  source: new VectorSource({
    url: function (extent) {
      const extentString = extent.join(',');

      console.log(layer);

      const url = `${zipServerUrl}?${params}&bbox=${extentString}`;
      return url;
    },
    strategy: bboxStrategy,
    format: new GeoJSON(),
  }),
  style: function (feature) {

    labelStyle
      .getText()
      .setText([
        feature.get('GEOID'),
        'bold 13px Calibri,sans-serif',
      ]);
    return style;
  },
  minZoom: 10,
});

const map = new Map({
  layers: [
    new TileLayer({
      className: 'bw',
      source: new OSM(),
    }),
    layer,
  ],
  target: 'map',
  view: new View({
    projection: 'EPSG:3857',
    center: [-95.241682, 38.967474],
    zoom: 13,
  }),
});