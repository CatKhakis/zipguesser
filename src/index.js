import printMe from './print.js';

import './style.css';
import "ol/ol.css";

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';

import {useGeographic} from 'ol/proj.js';

import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import Text from 'ol/style/Text.js';




const lakeStyle = {
  'fill-color': 'rgba(70, 130, 180, 0.2)',
  'stroke-color': 'rgba(25, 25, 112, 1)',
  'stroke-width': 1,
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
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1,
  }),
});
const style = [countryStyle, labelStyle];

const zipSource = new VectorSource({
    format: new GeoJSON(),
})

const layer = new VectorLayer({
  style: lakeStyle,
  source: zipSource,
  style: function (feature) {

    labelStyle
      .getText()
      .setText([
        feature.get('ZIP_CODE'),
        'bold 13px Calibri,sans-serif',
      ]);
    return style;
  },
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
    zoom: 8,
  }),
});






const zipServerUrl = `https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Boundaries_2023/FeatureServer/3/query`;

let idArray = await getData(`returnIdsOnly=true&where=OBJECTID+IS+NOT+NULL&f=pgeojson`);
idArray = idArray.properties.objectIds;

const chunkSize = 100;

let zipArray = [];

for (let i = 0; i < idArray.length; i += chunkSize) {
    const chunk = idArray.slice(i, i + chunkSize);

    addData(getData(`where=&objectIds=${chunk.join(`%2C`)}&f=pgeojson&outFields=ZIP_CODE`));
}

async function getData(params) {
  try {
    const response = await fetch(`${zipServerUrl}?${params}`, { cache: "force-cache" });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error.message);
  }
}

async function addData(chunkData) {
  const data = await chunkData;

  zipArray.push.apply(zipArray, data.features);

  if (zipArray.length === idArray.length) {
    addFeatures();
  }
}

async function addFeatures() {
  for (let i = 0; i < zipArray.length; i++) {
    const zipcode = new GeoJSON().readFeature(zipArray[i]);
    zipSource.addFeature(zipcode);
  }

}