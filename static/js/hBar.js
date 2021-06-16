// Set the dimensions and margins of the graph
var margin = {top: 60, right: 30, bottom: 40, left: 90},
    width = 460 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append the svg object to the body of the page
var svg = d3.select("#horizontal_bar")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


    
// Load data from API route
data = d3.json("/api/v1.0/export_countries").then(function(data){

    // Create array for input years
    selectionYear = []
    
    // Loop through data and append available years to array
    for (var i=0;i<data.length;i++) {
        var year = data[i]['year']
        
        if (selectionYear.includes(year)) {}
        else {
            selectionYear.push(year)
        }
    };

    d3.select("#data_year")
    .selectAll('myOptions')
    .data(selectionYear)
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return d ;})
    
    // Filter data by year
    var inputYear = 1990

    const new_data = data.filter(function(d) {
        return d.year == inputYear
    });

    data
        .forEach(function (d){
            d.production = +d.production
        });

    // Sort data from highest to lowest select value
    new_data
        .sort(function (a, b){
            return d3.descending(a.production, b.production)
        });

    var xMax = new_data[0]['production']

    // Add X-axis
    var x = d3.scaleLinear()
        .domain([0, xMax])
        .range([ 0, width]);

    svg
        .append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end"); 
    
    // Add Y-axis
    var y = d3.scaleBand()
        .range([ 0, height ])
        .domain(new_data.map(function(d) { return d.country; }))
        .padding(.3);
    
    svg
        .append("g")
        .attr("class", "yAxis")
        .call(d3.axisLeft(y))
    
    // Add Bars
    var bars = svg.selectAll("myRect")
        .data(new_data)
        .enter()
        .append("rect")
        .attr("x", x(0) )
        .attr("y", function(d) { return y(d.country); })
        .attr("width", function(d) { return x(d.production); })
        .attr("height", y.bandwidth() )
        .attr("fill", "#69b3a2")

    // Create function to update chart
    function update(inputYear) {

        // Create new data with the selected year
        var dataFilter = data.filter(function(d){return d.year==inputYear})

        // Sort filtered data
        dataFilter.sort(function (a, b){
        return d3.descending(a.production, b.production)
        });

        // Update X-axis
        var xMax = dataFilter[0]['production']

        var x = d3.scaleLinear()
        .domain([0, xMax])
        .range([ 0, width]);
        
        svg
            .select(".xAxis").remove();
        svg
            .append("g")
            .transition()
            .duration(1700)
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end"); 


        // Update Y-axis
        var y = d3.scaleBand()
        .range([ 0, height ])
        .domain(dataFilter.map(function(d) { return d.country; }))
        .padding(.3);

        svg
            .select(".yAxis").remove();
        
        svg
            .append("g")
            .transition()
            .duration(1700)
            .attr("class", "yAxis")
            .call(d3.axisLeft(y))

        // Update bars with filtered data
        bars.data(dataFilter)
            .transition()
            .duration(1000)
            .attr("y", function(d) { return y(d.country); })
            .attr("width", function(d) { return x(d.production); })
      };

    // When the button is changed, run the update function
    d3.select("#data_year").on("change", function(d) {

        // Recover the chosen value
        var inputYear = d3.select(this).property("value")

        // Run the update function with selected value
        update(inputYear)
    });

})
;
