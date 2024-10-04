// // console.log('Hello world!');

// // let locations = document.querySelector('#map');

// // locations = JSON.parse(
// //   locations.getAttribute('data-locations')
// // );

// // console.log(locations);

// // const key = 'C3DLQmcMit5zG5v6Klfz';

// // const attribution = new ol.control.Attribution({
// //   collapsible: false,
// // });

// // const source = new ol.source.TileJSON({
// //   url: `https://api.maptiler.com/maps/streets-v2/tiles.json?key=${key}`,
// //   tileSize: 512,
// //   crossOrigin: 'anonymous',
// // });

// // const map = new ol.Map({
// //   layers: [
// //     new ol.layer.Tile({
// //       source: source,
// //     }),
// //   ],
// //   controls: ol.control.defaults
// //     .defaults({ attribution: false })
// //     .extend([attribution]),
// //   target: 'map',
// //   view: new ol.View({
// //     constrainResolution: true,
// //     center: ol.proj.fromLonLat([16.62662018, 49.2125578]),
// //     zoom: 14,
// //   }),
// // });

// import Map from 'ol/Map.js';
// import OSM from 'ol/source/OSM.js';
// import TileLayer from 'ol/layer/Tile.js';
// import View from 'ol/View.js';

// const map = new Map({
//   layers: [
//     new TileLayer({
//       source: new OSM(),
//     }),
//   ],
//   target: 'map',
//   view: new View({
//     center: [0, 0],
//     zoom: 2,
//   }),
// });
