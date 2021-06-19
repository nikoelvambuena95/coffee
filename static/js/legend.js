

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
var square = svg.selectAll("mySquares")
    .data(data['legend_key']) // 'legend_key' JSON data object
    .enter()
    .append("rect")
      .attr("class", function(d){ return d.dataType})
      .attr("x", 100)
      .attr("y", function(d, i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d){ return d.color})
;



// Add text
var legendText = svg.selectAll("mylabels")
    .data(data['legend_key']) // 'legend_key' JSON data object
    .enter()
    .append("text")
      .attr("id", function(d){return "text_" + d.dataType})
      .attr("x", 100 + size*1.2)
      .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", "#050505")
      .text(function(d){ return d.dataType})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
;

// Create functions for "mouseover" and "mouseleave" events

function mouseOver() {
  d3.select(this)
    .transition()
    .duration(300)
    .attr("stroke", "#050505")
    .attr("stroke-width", "2px")
  
  var textID  = d3.select(this).attr("class")

  d3.select("#text_" + textID)
    .transition()
    .duration(200)
    .style("fill", function(d){return d.color})
}

function mouseLeave() {
  d3.select(this)
    .transition()
    .duration(300)
    .attr("stroke", "transparent")
  
  var textID  = d3.select(this).attr("class")

  d3.select("#text_" + textID)
    .transition()
    .duration(200)
    .style("fill", "#050505")
}

// Filter data on legend
svg
  .select(".export")
  .on("mouseover", mouseOver)
  .on("mouseleave", mouseLeave)
  .on("click", function(d){
    exportChart()
  });

svg
  .select(".production")
  .on("mouseover", mouseOver)
  .on("mouseleave", mouseLeave)
  .on("click", function(d){
    productionChart()
  });
