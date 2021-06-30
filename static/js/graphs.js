// Set the dimensions and margins of the graph
var margin = {top: 150, right: 10, bottom: 100, left: 90},
    width = 470 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// Append the svg object to the body of the page
var svg = d3.select("#analysis");

// Load data from API route
var promises = [
    d3.json("/api/v1.0/export_countries"),
    d3.json("api/v1.0/indicator_prices")
]

Promise.all(promises).then(initial_graphs)

function initial_graphs(data) {
    
    // Get data from API routes
    const export_country_dataRaw = data[0]
    const indicator_price_dataRaw = data[1]

    /// Create horizontal bar graphs ///

    // Create array for input years
    selectionYear = []
    
    // Loop through data and append available years to array
    for (var i=0;i<export_country_dataRaw.length;i++) {
        var year = export_country_dataRaw[i]['year']
        
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

     const new_data = export_country_dataRaw.filter(function(d) {
        return d.year == inputYear
        });

    
    new_data
        .forEach(function (d){
            d.production = +d.production
        });

    // Sort data from highest to lowest select value
    new_data
        .sort(function (a, b){
            return d3.descending(a.production, b.production)
        });

    var slice_data = new_data.slice(0, 10)

    var xMax = slice_data[0]['production']
    

    // Set Horizontal Bar SVG 
    var svgBar = svg.select("#horizontal_bar")
        .append("svg")
        .attr("class", "bar_chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    // Add X-axis
    var x = d3.scaleLinear()
        .domain([0, xMax])
        .range([ 0, width]);

    svgBar
        .append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end"); 

     // Add Y-axis
     var y = d3.scaleBand()
     .range([ 0, height])
     .domain(slice_data.map(function(d) { return d.country; }))
     .padding(.5);

     svgBar
        .append("g")
         .attr("class", "yAxis")
         .call(d3.axisLeft(y));
    
    // Add Bars
    var bars = svgBar.selectAll("myRect")
        .data(slice_data)
        .enter()
        .append("rect")
            .attr("class", "data_bars")
            .attr("x", x(0) )
            .attr("y", function(d) { return y(d.country); })
            .attr("width", function(d) { return x(d.production); })
            .attr("height", y.bandwidth() )
            .attr("fill", "#4490bd")
            .on("mouseover", function(d) {
                console.log(d.country)
                var barText = d3.select("#bar_text")
                barText.text(d.country)
            })
            .on("mouseout", function(d) {
                var barText = d3.select("#bar_text")
                barText.text("")
            })

    d3.select("#data_year").on("change", function(d){
       
        // Recover the chosen value
        var inputYear = d3.select(this).property("value")
        // Run the update function with selected value
        updateProductionBar(inputYear)
        updateProductionMap(inputYear)
    });

        var line_margin = {top: 100, right: 30, bottom: 40, left: 90},
            line_width = 1000 - line_margin.left - line_margin.right,
            line_height = 500 - line_margin.top - line_margin.bottom;
        
        // Append the svg object to the body of the page
        var svgLine = d3.select("#lineChart")
        .append("svg")
            .attr("width", line_width + line_margin.left + line_margin.right)
            .attr("height", line_height + line_margin.top + line_margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + line_margin.left + "," + line_margin.top + ")");
        
        // Prepare line chart data
        var export_lineData = []
        var indicator_lineData = []

        for (var i=0;i<selectionYear.length;i++) {
            var filterYear = selectionYear[i]

            const export_filterData = export_country_dataRaw.filter(function(d) {
                return d.year == filterYear 
            });
            const indicator_price_filterData = indicator_price_dataRaw.filter(function(d) {
                return d.year == filterYear 
            });

            productionArray = []
            exportArray = []
            indicator_priceArray = []
            

            export_filterData.map(function(d){ 
                var countryProduction = d.production
                var countryExport = d.export_1k
                productionArray.push(countryProduction)
                exportArray.push(countryExport)
            });
            indicator_price_filterData.map(function(d){
                var indicator_priceFilter = d.indicator_price
                indicator_priceArray.push(indicator_priceFilter)
            });

            var totalProduction = Math.round(d3.sum(productionArray));
            var totalExport = Math.round(d3.sum(exportArray));
            var averageIndicatorPrice = d3.sum(indicator_priceArray)/12;

            export_lineData.push({
                year: filterYear,
                production: totalProduction,
                export: totalExport
            });
            indicator_lineData.push({
                year: filterYear,
                indicator_price: averageIndicatorPrice
            });
        }
        console.log(export_lineData)
        console.log(indicator_lineData)

         // Add X-axis
         var x = d3.scaleLinear()
         .domain([d3.min(export_lineData, function(d) {return d.year; }),
              d3.max(export_lineData, function(d) { return d.year; })])
         .range([ 0, line_width ]);

         svgLine.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + line_height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        // Add first Y-axis
        var y1 = d3.scaleLinear()
            .domain([50000, d3.max(export_lineData, function(d) { return d.production; })])
            .range([ line_height, 0 ]);

        svgLine.append("g")
            .attr("class", "line1_yAxis")
            .call(d3.axisLeft(y1));

        // Add second Y-axis
        var y2 = d3.scaleLinear()
            .domain([30, d3.max(indicator_lineData, function(d) { return d.indicator_price; })])
            .range([ line_height, 0 ]);

        svgLine.append("g")
            .attr("class", "line2_yAxis")
            .attr("transform", "translate( " + line_width + ", 0 )")
            .call(d3.axisRight(y2))

        // Add production line
        var productionLine = d3.line()
                .x(function(d) { return x(d.year) })
                .y(function(d) { return y1(d.production) })
        
        svgLine
            .append("path")
            .datum(export_lineData)
            .attr("fill", "none")
            .attr("stroke", "#4490bd")
            .attr("stroke-width", 2)
            .attr("d", productionLine)
            .attr("class", "line")

        // Add export line
        var exportLine  = d3.line()
                .x(function(d) { return x(d.year) })
                .y(function(d) { return y1(d.export) })

        svgLine
            .append("path")
            .datum(export_lineData)
            .attr("fill", "none")
            .attr("stroke", "#d42e04")
            .attr("stroke-width", 2)
            .attr("d", exportLine)
            .attr("class", "line")
        
        // Add indicator price line
        var indicatorLine = d3.line()
                .x(function(d) { return x(d.year) })
                .y(function(d) { return y2(d.indicator_price)})
        svgLine
            .append("path")
            .datum(indicator_lineData)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 2)
            .attr("d", indicatorLine)
            .attr("class", "line")
            .style("stroke-dasharray", ("3, 3"))
        
};

        
        // // Create rectangle to catch mouse movements
        // var mouseGraph = svg.append("g")
        //     .attr("class", "mouse-over-effects");

        // mouseGraph.append("path") // this is the black vertical line to follow mouse
        //     .attr("class", "mouse-line")
        //     .style("stroke", "black")
        //     .style("stroke-width", "1px")
        //     .style("opacity", "0");
        
        // var lines = document.getElementsByClassName('line'); // Get lines on chart

        // var mousePerLine = mouseGraph.selectAll('.mouse-per-line')
        //     .data(chartData) 
        //     .enter()
        //     .append("g")
        //     .attr("class", "mouse-per-line");

        // mousePerLine.append("text")
        //     .attr("transform", "translate(10,3)");

        // mouseGraph.append('svg:rect') // append a rect to catch mouse movements on canvas
        //     .attr('width', width) // can't catch mouse events on a g element
        //     .attr('height', height)
        //     .attr('fill', 'none')
        //     .attr('pointer-events', 'all')
        //     .on('mouseout', function() { // on mouse out hide line, circles and text
        //         d3.select(".mouse-line")
        //           .style("opacity", "0");
        //         d3.selectAll(".mouse-per-line text")
        //           .style("opacity", "0");
        //       })
        //       .on('mouseover', function() { // on mouse in show line, circles and text
        //         d3.select(".mouse-line")
        //           .style("opacity", "1");
        //         d3.selectAll(".mouse-per-line text")
        //           .style("opacity", "1");
        //       })
        //       .on('mousemove', function() { // mouse moving over canvas
        //         var mouse = d3.mouse(this);
        //         d3.select(".mouse-line")
        //           .attr("d", function() {
        //             var d = "M" + mouse[0] + "," + height;
        //             d += " " + mouse[0] + "," + 0;
        //             return d;
        //           });

        //           d3.selectAll(".mouse-per-line")
        //             .attr("transform", function(d, i) {
        //             // console.log(width/mouse[0])
        //             var xDate = x.invert(mouse[0]),
        //                 bisect = d3.bisector(function(d) { return d.year; }).right;
        //                 idx = bisect(d.production, xDate);
                        
        //             var beginning = 0,
        //                 // end = lines[i].getTotalLength(),
        //                 target = null;
                    
        //             var end = lines[i].getTotalLength()
        //             // console.log((beginning + end) / 2) 
                        
        //             while (true){

        //             target = Math.floor((beginning + end) / 2);
        //             pos = lines[i].getPointAtLength(target);

        //             if ((target == end || target == beginning) && pos.x !== mouse[0]) {
        //                 break;
        //             }

        //             if (pos.x > mouse[0]) { 
        //                 end = target;
        //             }
        //             else if (pos.x < mouse[0]) {
        //                 beginning = target;
        //             }
        //             else {
        //                 break; //position found
        //             }
        //             }
            
        //             d3.select(this).select('text')
        //             .text(y1.invert(pos.y).toFixed(2));
              
        //             return "translate(" + mouse[0] + "," + pos.y +")";
        //             });
        //         });
        

//     };
//     multiLineChart()
// })
// ;






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