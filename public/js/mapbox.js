/*eslint-disable */

const displayMap = locations =>{

 mapboxgl.accessToken = 'pk.eyJ1IjoidmlyYWotdmlkdXJhbmdhIiwiYSI6ImNtamt1cTVyZzBjbzgzdnM2NmtudmwyOW8ifQ.uwhS-bM1hjuskl-NlQniYQ';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className='marker'

    // Add marker
    new mapboxgl.Marker({
        element:el,
        anchor:'bottom'
    }).setLngLat(loc.coordinates)
      .addTo(map);

      //add popup message
      new mapboxgl.Popup({offset:30}).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day} : ${loc.description} </p>`)
      .addTo(map);

    // Extend map bounds to include current locations
    bounds.extend(loc.coordinates);
  });

  // Fit map to markers
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
}

