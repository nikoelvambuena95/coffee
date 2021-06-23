// Set the dimensions and margins of the graph
var margin = {top: 100, right: 30, bottom: 40, left: 90},
    width = 1500 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// The svg
var svgMap = d3.select("#worldMap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
;

// Path and projection
var path = d3.geoPath();
var projection = d3.geoNaturalEarth1()
  .scale(250)
  .center([0,20])
;

var mapData = d3.map();
// var color = d3.scaleQuantile()
// .domain(d3.json("/api/v1.0/export_countries").then(function(data){
//     return +data.production
// }))
// .range(d3.schemeBlues[7])

var color = d3.scaleThreshold()
.domain([500, 1000, 5000, 15000, 30000, 70000])
.range(d3.schemeBlues[7])


d3.json("/api/v1.0/export_countries").then(function(data){
    // Test inputYear
    var inputYear = 2000
    
    const new_data = data.filter(function(d) {
        return d.year == inputYear
    });

    data
        .forEach(function (d){
            d.production = +d.production
        });

    for (var i=0;i<new_data.length;i++) {
        mapData.set(new_data[i].country, new_data[i].production)
    };
})

// d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson").then(function(data){
//     console.log(data.features)
// })


var promises = [
    d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson"),
    d3.json("/api/v1.0/export_countries") 
]


Promise.all(promises).then(choropleth)

function choropleth(data) {
    var productionData = data[1]
    console.log(data[0].features)
    // Draw each country
    svgMap.append("g")
        .selectAll("path")
        .data(data[0].features)
        .enter()
        .append("path")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("fill", function (d) {
                d.total = mapData.get(d.properties.name) || 0;
                return color(d.total);
              })
            // .attr("fill", "black")
            .style("stroke", "#fff")
};


// // Load external data 
// data = d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson").then(function(data){
// // Draw the map
//     svgMap.append("g")
//         .selectAll("path")
//         .data(data.features)
//         .enter().append("path")
//             .attr("fill", "#31cc9b")
//             .attr("d", d3.geoPath()
//                 .projection(projection)
//             )
//             .style("stroke", "#fff")
// })
// ;








// function productionMap() {
//     // Load external data 
//     data = d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson").then(function(data){
//     // Draw the map
//         svgMap.append("g")
//             .selectAll("path")
//             .data(data.features)
//             .enter()
//                 .append("path")
//                     .attr("fill", "#31cc9b")
//                     .attr("d", d3.geoPath()
//                         .projection(projection)
//                     )
//                     .style("stroke", "#fff")
//     });
// }
// ;







// function exportMap() {
//     // Load external data 
//     data = d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson").then(function(data){
//     // Draw the map
//         svgMap.append("g")
//             .selectAll("path")
//             .data(data.features)
//             .enter().append("path")
//                 .attr("fill", "#d42e04")
//                 .attr("d", d3.geoPath()
//                     .projection(projection)
//                 )
//                 .style("stroke", "#fff")
//     })
//     ;
// }

