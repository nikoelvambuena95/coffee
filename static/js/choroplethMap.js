// Set the dimensions and margins of the graph
var margin = {top: 100, right: 30, bottom: 40, left: 90},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// The svg
var svgMap = d3.select("#worldMap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Map and projection
var projection = d3.geoNaturalEarth1()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2])

// Load external data 
data = d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson").then(function(data){
// Draw the map
    svgMap.append("g")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
            .attr("fill", "#31cc9b")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "#fff")
})
;








function productionMap() {
    // Load external data 
    data = d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson").then(function(data){
    // Draw the map
        svgMap.append("g")
            .selectAll("path")
            .data(data.features)
            .enter()
                .append("path")
                    .attr("fill", "#31cc9b")
                    .attr("d", d3.geoPath()
                        .projection(projection)
                    )
                    .style("stroke", "#fff")
    });
}
;







function exportMap() {
    // Load external data 
    data = d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson").then(function(data){
    // Draw the map
        svgMap.append("g")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
                .attr("fill", "#d42e04")
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .style("stroke", "#fff")
    })
    ;
}