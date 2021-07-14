
// Set the dimensions and margins of the graph
var margin = {top: 100, right: 30, bottom: 40, left: 90},
    width = 1500 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// The svg
var svgMap = d3.select("#worldMap")
    .append("svg")
    .attr("width", width
    //  + margin.left + margin.right
     )
    .attr("height", height 
    // + margin.top + margin.bottom
    )
;

// Path and projection
var path = d3.geoPath();
var projection = d3.geoNaturalEarth1()
  .scale(220)
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

var promises = [
    d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson"),
    d3.json("/api/v1.0/export_countries") 
]

Promise.all(promises).then(choropleth)

function choropleth(data) {

    // Create map data
    var productionData = data[1]
    
    var selectYear = 1990

    var new_data = productionData.filter(function(d) {
        return d.year == selectYear
    });

    for (var i=0;i<new_data.length;i++) {
        mapData.set(new_data[i].country, new_data[i].production)
    };

    console.log(mapData)
    console.log(new_data)
    // console.log(data[0].features)

    // Draw each country
    svgMap
        .append("g")
        .attr("id", "worldChart")
        .selectAll("path")
        .data(data[0].features)
        .enter()
        .append("path")
            .attr("class", "country")
            .attr("id", function (d) {
                return (d.properties.name + "_initial")
            })
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("fill", function (d) {
                d.total = mapData.get(d.properties.name) || 0;
                // console.log(d.total)
                    return color(d.total);
            })
            .style("opacity", function (d){
                for (var i=0;i<d.length;i++) {
                    console.log(d.properties)
                };
                return "1"
            })
            .style("stroke", "#1f1f1f")
    
};



function productionChoro() {

    svgMap.select("g").selectAll("path").remove();

    var color = d3.scaleThreshold()
    .domain([500, 1000, 5000, 15000, 30000, 70000])
    .range(d3.schemeBlues[7])

    var promises = [
        d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson"),
        d3.json("/api/v1.0/export_countries") 
    ]

    Promise.all(promises).then(choropleth)

    function choropleth(data) {
        
        // Create map data
        var productionData = data[1]
        
        var selectYear = 1990

        var new_data = productionData.filter(function(d) {
            return d.year == selectYear
        });

        for (var i=0;i<new_data.length;i++) {
            mapData.set(new_data[i].country, new_data[i].production)
        };

        // Draw each country
        svgMap
            .select("#worldChart")
            .selectAll("path")
            .data(data[0].features)
            .enter()
            .append("path")
                .attr("class", "country")
                .attr("id", function (d) {
                    return (d.properties.name)
                })
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .attr("fill", function (d) {
                    d.total = mapData.get(d.properties.name) || 0;
                    return color(d.total);
                })
                .style("stroke", "#1f1f1f")
                .on("click", function (d) {
                    country = d.properties.name

                    var countryData = new_data.filter(function(d){
                        return d.country == country
                    })
                    var countryExport = countryData[0].export_1k
                    var countryProduction = countryData[0].production
                    var countryYear = countryData[0].year
                })
    
    };

};





function exportChoro() {

    console.log("Load Export Choropleth Map")

    svgMap.select("g").selectAll("path").remove();

    var red_color = d3.scaleThreshold()
    .domain([500, 1000, 5000, 15000, 30000, 70000])
    .range(d3.schemeReds[7])

    var promises = [
        d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson"),
        d3.json("/api/v1.0/export_countries") 
    ]

    Promise.all(promises).then(choropleth)

    function choropleth(data) {

        // Create map data
        var exportData = data[1]
        
        var selectYear = 1995

        var new_data = exportData.filter(function(d) {
            return d.year == selectYear
        });

        for (var i=0;i<new_data.length;i++) {
            mapData.set(new_data[i].country, new_data[i].export_1k)
        };

        // Draw each country    
        svgMap
            .select("#worldChart")
            .selectAll("path")
            .data(data[0].features)
            .enter()
            .append("path")
                .attr("id", function (d) {
                return (d.properties.name)
            })
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .attr("fill", function (d) {
                    d.total = mapData.get(d.properties.name) || 0;
                    return red_color(d.total);
                })
                .style("stroke", "#1f1f1f")
                .on("click", function (d) {
                    country = d.properties.name

                    var countryData = new_data.filter(function(d){
                        return d.country == country
                    })
                    var countryExport = countryData[0].export_1k
                    var countryProduction = countryData[0].production
                    var countryYear = countryData[0].year
                })
                
    };

};



//// Create functions for filtering map data by year ////

function updateProductionMap(inputYear) {

    svgMap.select("g").selectAll("path").remove();

    var color = d3.scaleThreshold()
    .domain([500, 1000, 5000, 15000, 30000, 70000])
    .range(d3.schemeBlues[7])

    var promises = [
        d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson"),
        d3.json("/api/v1.0/export_countries") 
    ]
 
    Promise.all(promises).then(choropleth)

    function choropleth(data) {

        // Create map data
        var productionData = data[1]
        
        // Create new data with the selected year

        var new_data = productionData.filter(function(d) {
            return d.year == inputYear
        });

        for (var i=0;i<new_data.length;i++) {
            mapData.set(new_data[i].country, new_data[i].production)
        };

        // Draw each country
        svgMap
            .select("#worldChart")
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
                .style("stroke", "#1f1f1f")
                .on("click", function (d) {
                    country = d.properties.name
    
                    var countryData = new_data.filter(function(d){
                        return d.country == country
                    })
                    var countryExport = countryData[0].export_1k
                    var countryProduction = countryData[0].production
                    var countryYear = countryData[0].year
                })
      
    };

};



function updateExportMap(inputYear) {

    svgMap.select("g").selectAll("path").remove();

    var color = d3.scaleThreshold()
    .domain([500, 1000, 5000, 15000, 30000, 70000])
    .range(d3.schemeReds[7])

    var promises = [
        d3.json("http://enjalot.github.io/wwsd/data/world/world-110m.geojson"),
        d3.json("/api/v1.0/export_countries") 
    ]
 
    Promise.all(promises).then(choropleth)

    function choropleth(data) {

        // Create map data
        var exportData = data[1]
        
        // Create new data with the selected year

        var new_data = exportData.filter(function(d) {
            return d.year == inputYear
        });

        for (var i=0;i<new_data.length;i++) {
            mapData.set(new_data[i].country, new_data[i].export_1k)
        };

        // Draw each country
        svgMap
            .select("#worldChart")
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
                .style("stroke", "#1f1f1f")
                .on("click", function (d) {
                    country = d.properties.name

                    var countryData = new_data.filter(function(d){
                        return d.country == country
                    })
                    var countryExport = countryData[0].export_1k
                    var countryProduction = countryData[0].production
                    var countryYear = countryData[0].year
                });
            
    };

};
