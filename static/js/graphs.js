// Set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 40, left: 90},
    width = 470 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// Append the svg object to the body of the page
var svg = d3.select("#horizontal_bar")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("id", "chartG")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Load data from API route
data = d3.json("/api/v1.0/export_countries").then(function(data){

    // console.log(data)
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
        .range([ 0, 300]);

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
            .attr("class", "productionData")
            .attr("x", x(0) )
            .attr("y", function(d) { return y(d.country); })
            .attr("width", function(d) { return x(d.production); })
            .attr("height", y.bandwidth() )
            .attr("fill", "#4490bd")
    
    d3.select("#data_year").on("change", function(d){
       
        // Recover the chosen value
        var inputYear = d3.select(this).property("value")
        // Run the update function with selected value
        updateProductionBar(inputYear)
        updateProductionMap(inputYear)
    });


    //// Function creating Multi-Line Chart ////
    function multiLineChart() {
        var margin = {top: 100, right: 30, bottom: 40, left: 90},
            width = 1000 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // Append the svg object to the body of the page
        var svg = d3.select("#lineChart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Prepare line chart data
        var chartData = []

        for (var i=0;i<selectionYear.length;i++) {
            var filterYear = selectionYear[i]
        
            const updateData = data.filter(function(d) {
                return d.year == filterYear 
            });

            productionArray = []
            exportArray = []

            updateData.map(function(d){ 
                var countryProduction = d.production
                var countryExport = d.export_1k
                productionArray.push(countryProduction)
                exportArray.push(countryExport)
            })

            var totalProduction = Math.round(d3.sum(productionArray))
            var totalExport = Math.round(d3.sum(exportArray))

            chartData.push({
                year: filterYear,
                production: totalProduction,
                export: totalExport
            })
        }
        // console.log(chartData)

        // Add X-axis
        var x = d3.scaleLinear()
            .domain([d3.min(chartData, function(d) {return d.year; }),
                 d3.max(chartData, function(d) { return d.year; })])
            .range([ 0, width ]);

        svg.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        // Add Y-axis
        var y = d3.scaleLinear()
            .domain([50000, d3.max(chartData, function(d) { return d.production; })])
            .range([ height, 0 ]);
        svg.append("g")
            .attr("class", "yAxis")
            .call(d3.axisLeft(y));
        
        var productionLine = d3.line()
                .x(function(d) { return x(d.year) })
                .y(function(d) { return y(d.production) })

        var exportLine  = d3.line()
                .x(function(d) { return x(d.year) })
                .y(function(d) { return y(d.export) })

        // Add the production line
        svg
            .append("path")
            .datum(chartData)
            .attr("fill", "none")
            .attr("stroke", "#4490bd")
            .attr("stroke-width", 2)
            .attr("d", productionLine)
            .attr("class", "line")
        
        // Add the production line
        svg
            .append("path")
            .datum(chartData)
            .attr("fill", "none")
            .attr("stroke", "#d42e04")
            .attr("stroke-width", 2)
            .attr("d", exportLine)
            .attr("class", "line")
        
        // Create rectangle to catch mouse movements
        var mouseGraph = svg.append("g")
            .attr("class", "mouse-over-effects");

        mouseGraph.append("path") // this is the black vertical line to follow mouse
            .attr("class", "mouse-line")
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("opacity", "0");
        
        var lines = document.getElementsByClassName('line'); // Get lines on chart

        var mousePerLine = mouseGraph.selectAll('.mouse-per-line')
            .data(chartData) 
            .enter()
            .append("g")
            .attr("class", "mouse-per-line");

        mousePerLine.append("text")
            .attr("transform", "translate(10,3)");

        mouseGraph.append('svg:rect') // append a rect to catch mouse movements on canvas
            .attr('width', width) // can't catch mouse events on a g element
            .attr('height', height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', function() { // on mouse out hide line, circles and text
                d3.select(".mouse-line")
                  .style("opacity", "0");
                d3.selectAll(".mouse-per-line text")
                  .style("opacity", "0");
              })
              .on('mouseover', function() { // on mouse in show line, circles and text
                d3.select(".mouse-line")
                  .style("opacity", "1");
                d3.selectAll(".mouse-per-line text")
                  .style("opacity", "1");
              })
              .on('mousemove', function() { // mouse moving over canvas
                var mouse = d3.mouse(this);
                d3.select(".mouse-line")
                  .attr("d", function() {
                    var d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                  });

                  d3.selectAll(".mouse-per-line")
                    .attr("transform", function(d, i) {
                    // console.log(width/mouse[0])
                    var xDate = x.invert(mouse[0]),
                        bisect = d3.bisector(function(d) { return d.year; }).right;
                        idx = bisect(d.production, xDate);
                        
                    var beginning = 0,
                        // end = lines[i].getTotalLength(),
                        target = null;
                    
                    var end = lines[i].getTotalLength()
                    // console.log((beginning + end) / 2) 
                        
                    while (true){

                    target = Math.floor((beginning + end) / 2);
                    pos = lines[i].getPointAtLength(target);

                    if ((target == end || target == beginning) && pos.x !== mouse[0]) {
                        break;
                    }

                    if (pos.x > mouse[0]) { 
                        end = target;
                    }
                    else if (pos.x < mouse[0]) {
                        beginning = target;
                    }
                    else {
                        break; //position found
                    }
                    }
            
                    d3.select(this).select('text')
                    .text(y.invert(pos.y).toFixed(2));
              
                    return "translate(" + mouse[0] + "," + pos.y +")";
                    });
                });
        

    };
    multiLineChart()
})
;




// Prep indicator price data
d3.json("api/v1.0/indicator_prices").then(function(data){
    
    // Create array for years to caculate average ICO
    indicator_yearList = []

    for (var i=0;i<data.length;i++) {
        var year = data[i]['year']

        if (indicator_yearList.includes(year)) {}
        else {
            indicator_yearList.push(year)
        }
    };

    // Create a function to find average ICO score //
    var indicator_priceData = []

    for (var i=0;i<indicator_yearList.length;i++) {
        var filterYear = indicator_yearList[i]

        const indicator_filterData = data.filter(function(d) {
            return d.year == filterYear 
        });

        indicator_priceArray = []

        indicator_filterData.map(function(d){
            var indicator_priceFilter = d.indicator_price
            indicator_priceArray.push(indicator_priceFilter)
        })
        
        var averageIndicatorPrice = (d3.sum(indicator_priceArray)/12).toFixed(2)

        indicator_priceData.push({
            year: filterYear,
            indicator_price: averageIndicatorPrice
        })
    }
    console.log(indicator_priceData)
})




// Define function that generates "production" bar chart
function productionChart() {
    data = d3.json("/api/v1.0/export_countries").then(function(data) {
        
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

        d3.selectAll('option').remove();// Remove input years from previous chart
    
        d3.select("#data_year")
        .selectAll('myOptions')
        .data(selectionYear)
        .enter()
        .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d ;});
        
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
            .select(".xAxis").remove();// Remove X-axis from previous chart
        svg
            .append("g")
                .transition()
                .duration(2000) 
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
            .select(".yAxis").remove();// Remove Y-axis from previous chart
        svg
            .append("g")
                .transition()
                .duration(2000)
                .attr("class", "yAxis")
                .call(d3.axisLeft(y));
        
        // Add Bars
        svg
            .selectAll("rect").remove();// Remove bars from pervious chart

        svg.selectAll("myRect")
            .data(new_data)
            .enter()
            .append("rect")
                .transition()
                .duration(1700)
                .attr("class", "productionData")
                .attr("x", x(0) )
                .attr("y", function(d) { return y(d.country); })
                .attr("width", function(d) { return x(d.production); })
                .attr("height", y.bandwidth() )
                .attr("fill", "#4490bd");
            
        d3.select("#data_year").on("change", function(d){
          
            // Recover the chosen value
            var inputYear = d3.select(this).property("value")
            // Run the update function with selected value
            updateProductionBar(inputYear)
            updateProductionMap(inputYear)
        });
    });

}
;









// Define function that generates "export" bar chart
function exportChart() {
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

        d3.selectAll('option').remove();// Remove input years from previous chart
    
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
                d.export_1k = +d.export_1k
            });
    
        // Sort data from highest to lowest select value
        new_data
            .sort(function (a, b){
                return d3.descending(a.export_1k, b.export_1k)
            });
    
        var xMax = new_data[0]['export_1k']
    
        // Add X-axis
        var x = d3.scaleLinear()
            .domain([0, xMax])
            .range([ 0, width]);

        svg
            .select(".xAxis").remove();// Remove X-axis from previous chart
        svg
            .append("g")
                .transition()
                .duration(2000) 
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
            .select(".yAxis").remove();// Remove Y-axis from previous chart
        svg
            .append("g")
                .transition()
                .duration(2000)     
                .attr("class", "yAxis")
                .call(d3.axisLeft(y))
        

        // Add Bars
        svg
            .selectAll("rect").remove();// Remove bars from pervious chart
        var bars = svg.selectAll("myRect")
            .data(new_data)
            .enter()
            .append("rect")
                .transition()
                .duration(1700)
                .attr("class", "exportData")
                .attr("x", x(0) )
                .attr("y", function(d) { return y(d.country); })
                .attr("width", function(d) { return x(d.export_1k); })
                .attr("height", y.bandwidth() )
                .attr("fill", "#d42e04")
            
        d3.select("#data_year").on("change", function(d){
            
            // Recover the chosen value
            var inputYear = d3.select(this).property("value")
            // Run the update function with selected value
            updateExportBar(inputYear)
            updateExportMap(inputYear)
        });

    });
};








//// Create functions to filter bar graph data by year ////

function updateProductionBar(inputYear) {
    data = d3.json("/api/v1.0/export_countries").then(function(data){ 

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
        // When using the "bars" variable method similar to initial load, errors occurred //
        svg
            .selectAll("rect")
            .data(dataFilter)
                .transition()
                .duration(1000)
                .attr("y", function(d) { return y(d.country); })
                .attr("width", function(d) { return x(d.production); })
                .attr("fill", "#4490bd");
    })
}


function updateExportBar(inputYear) {
    data = d3.json("/api/v1.0/export_countries").then(function(data){ 

        // Create new data with the selected year
        var dataFilter = data.filter(function(d){return d.year==inputYear})
       
        // Sort filtered data
        dataFilter.sort(function (a, b){
            return d3.descending(a.export_1k, b.export_1k)
            });
        
        // Update X-axis
        var xMax = dataFilter[0]['export_1k']
    
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
        // When using the "bars" variable method similar to initial load, errors occurred //
        svg
            .selectAll("rect")
            .data(dataFilter)
                .transition()
                .duration(1000)
                .attr("y", function(d) { return y(d.country); })
                .attr("width", function(d) { return x(d.export_1k); })
                .attr("fill", "#d42e04");
    })
}