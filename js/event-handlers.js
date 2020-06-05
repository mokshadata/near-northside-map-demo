function initEventHandlers(map) {

  // pixels the map pans when the up or down arrow is clicked
  var deltaDistance = 100;

  // degrees the map rotates when the left or right arrow is clicked
  var deltaDegrees = 25;

  function easing(t) {
    return t * (2 - t);
  }

  function handleKeyDown(e) {
    if ([37, 38, 39, 40].indexOf(e.which) < 0) {
      return
    }

    e.preventDefault();
    if (e.which === 38) {
      // up
      map.panBy([0, -deltaDistance], {
        easing: easing
      });
    } else if (e.which === 40) {
      // down
      map.panBy([0, deltaDistance], {
        easing: easing
      });
    } else if (e.which === 37) {
      // left
      map.easeTo({
        bearing: map.getBearing() - deltaDegrees,
        easing: easing
      });
    } else if (e.which === 39) {
      // right
      map.easeTo({
        bearing: map.getBearing() + deltaDegrees,
        easing: easing
      });
    }
  }

  var hoveredParcelId = null;
  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });


  function showValueForParcel(e) {
    map.getCanvas().style.cursor = 'pointer';

    // var coordinates = e.features[0].geometry.coordinates.slice();
    var currency = e.features[0].properties.tot_appr_val && numeral(e.features[0].properties.tot_appr_val).format('$ 0,0[.]00') || 'N/A'

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    //   coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    // }
    // console.log(coordinates, e.lngLat)

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup
      .setLngLat(e.lngLat)
      .setHTML('<div style="text-align: center;">' + e.features[0].properties.name + '<br/>' + currency + '</div>')
      .addTo(map);
  }

  function handleMouseMoveOnParcels(e) {
    if (e.features && e.features.length > 0) {
      if (hoveredParcelId) {
        map.setFeatureState(
          { source: 'parcels', id: hoveredParcelId },
          { hover: false }
        );
      }
      showValueForParcel(e)
      hoveredParcelId = e.features[0].id;
      map.setFeatureState(
        { source: 'parcels', id: hoveredParcelId },
        { hover: true }
      );
    }
  }

  function handleMouseLeaveOnParcels() {
    if (hoveredParcelId) {
      map.setFeatureState(
        { source: 'parcels', id: hoveredParcelId },
        { hover: false }
      );
    }
    hoveredParcelId = null;
    map.getCanvas().style.cursor = '';
    popup.remove();
  }

  return {
    handleKeyDown: handleKeyDown,
    handleMouseMoveOnParcels: handleMouseMoveOnParcels,
    handleMouseLeaveOnParcels: handleMouseLeaveOnParcels
  }
}