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
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }).addTo(myMap);

  // Load data
  // local for production
  var production_data = "../resources/totalProduction_april.csv"

  // Grab data with d3
  d3.csv(production_data).then(function(data) {
    
    // Create choropleth layer
    geo_data = L.choropleth(data, {

      // Define what property to use
      valueProperty: 2,

      // Set color scale
      scale: ["#ffffb2", "#b10026"],

      // Number of breaks in number range
      steps: 50,

      // Chosse a mode: "q" for quartile, "e" for equidistant, "k" for k-means
      mode: "q",
      style: {
        // Border color
        color: "#fff",
        weight: 1,
        fillOpacity: 0.8
      },
    }).addTo(myMap);
  });

  