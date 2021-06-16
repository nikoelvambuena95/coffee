// Set the dimensions and margins of the graph
var margin = {top: 60, right: 30, bottom: 40, left: 90},
    width = 460 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append the svg object to the body of the page
var svg = d3.select("#legend")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Create a dictionary of keys
const keys = {
    "legend_key": [
        {"dataType" : "production", "color" : "#31cc9b"},
        {"dataType" : "export", "color" : "#d42e04"}
    ]
};

// Stringify dictionary of keys, parse JSON
var legendData = JSON.stringify(keys)
var data = JSON.parse(legendData)

// Add square 
var size = 20
svg.selectAll("mydots")
  .data(data['legend_key']) // 'legend_key' JSON data object
  .enter()
  .append("rect")
    .attr("x", 100)
    .attr("y", function(d, i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return d.color})
;

// Add text
svg.selectAll("mylabels")
  .data(data['legend_key']) // 'legend_key' JSON data object
  .enter()
  .append("text")
    .attr("x", 100 + size*1.2)
    .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return d.color})
    .text(function(d){ return d.dataType})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
;