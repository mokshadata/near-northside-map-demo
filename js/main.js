mapboxgl.accessToken = 'pk.eyJ1IjoibmVlcmFqLXRhbmRvbiIsImEiOiJjazlrMHY3NzUwYXFvM3FwaGgwbzB3cTBkIn0.fVzQkJWkgS3oXju4bwOoaA';
var map = new mapboxgl.Map({
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-95.35918894203877, 29.779466495026426], //{lng: -95.35918894203877, lat: 29.779466495026426}
  pitch: 60, // pitch in degrees
  bearing: 0, // bearing in degrees
  zoom: 16,
  container: 'map',
  antialias: true
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
var handlers = initEventHandlers(map);

// The 'building' layer in the mapbox-streets vector source contains building-height
// data from OpenStreetMap.
map.on('load', function () {
  map.addSource('near-northside', {
    type: 'geojson',
    data: './data/near-northside.geojson'
  })
  map.addSource('census-tracts', {
    type: 'geojson',
    data: './data/census-tracts.geojson'
  })
  map.addSource('parcels', {
    type: 'geojson',
    data: './data/parcels.geojson'
  })

  map.getCanvas().focus();
  map.getCanvas().addEventListener('keydown', handlers.handleKeyDown, true);
  // When the user moves their mouse over the parcel-fill layer, we'll update the
  // feature parcel for the feature under the mouse.
  map.on('mousemove', 'parcel-fills', handlers.handleMouseMoveOnParcels);
  // When the mouse leaves the parcel-fill layer, update the feature parcel of the
  // previously hovered feature.
  map.on('mouseleave', 'parcel-fills', handlers.handleMouseLeaveOnParcels);

  // Insert the following layers beneath any symbol layer.
  var layers = map.getStyle().layers;
  var labelLayerId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
      labelLayerId = layers[i].id;
      break;
    }
  }

  map.addLayer({
      'id': 'near-northside',
      'type': 'line',
      'source': 'near-northside',
      'layout': {},
      'paint': {
        'line-color': '#088',
        'line-width': 4
      }
    },
    labelLayerId
  );


  // map.addLayer({
  //     'id': 'census-tracts',
  //     'type': 'fill',
  //     'source': 'census-tracts',
  //     'layout': {},
  //     'paint': {
  //       'fill-color': '#FFF',
  //       'fill-opacity': 0.1
  //     }
  //   },
  //   labelLayerId
  // );

  map.addLayer({
      'id': 'parcel-fills',
      'type': 'fill',
      'source': 'parcels',
      'layout': {},
      'filter': ["all", ['!=', 0, ['get', 'tot_appr_val']], ["to-boolean", ['get', 'tot_appr_val']]],
      'paint': {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'tot_appr_val'],
          245,
          ['to-color', '#edf8e9'],
          7812400,
          ['to-color', '#006d2c']
        ]
      }
    },
    labelLayerId
  );

  map.addLayer({
      'id': 'parcel-lines',
      'type': 'line',
      'source': 'parcels',
      'paint': {
        'line-color': '#006d2c',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0.25,
          15.05,
          1
        ]
      },
      'layout': {
      }
    },
    labelLayerId
  );

  map.addLayer(
    {
      'id': '3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'minzoom': 15,
      'paint': {
        'fill-extrusion-color': '#aaa',

        // use an 'interpolate' expression to add a smooth transition effect to the
        // buildings as the user zooms in
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'height']
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.6
      }
    },
    labelLayerId
  );
});