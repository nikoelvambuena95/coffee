// Create map object 
var myMap = L.map("map", {
    center: [45.52, -122.67],
    zoom: 13
  });

  // Create tile later
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 8,
    minZoom:5,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  }).addTo(myMap);

  // Load data
  var production_data = "/api/v1.0/export_countries"

  d3.json(production_data).then(function(data){
    // Loop through production_data
    for (var i = 0; i < data.length; i++) {
    console.log(data[i].location),
    console.log(data[i].production)

    // Add circles to the map 
    L.circle(data[i].location, {
      fillOpacity: 0.75,
      color: 'white',
      fillColor: 'red',
      // Adjust radius
      radius: data[i].production * 50
    }).bindPopup("<h1>" + data[i].country + "</h1> <hr> <h3>Export:" + data[i].production + "</h3>").addTo(myMap);
  };
  })

  