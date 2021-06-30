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

// Append the svg object to the body of the page
var svg = d3.select("#lineChart")
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Load data from API route
var promises = [
    d3.json("/api/v1.0/export_countries"),
    d3.json("api/v1.0/indicator_prices")
]

Promise.all(promises).then(multilineChart)

function multilineChart(data) {
    // Get data from API routes
    const export_country_dataRaw = data[0]
    const indicator_price_dataRaw = data[1]


    // Prepare line chart data
    var export_lineData = []
    var indicator_lineData = []

    // Create array for available years
    selectionYear = []
    
    // Loop through data and append available years to array
    for (var i=0;i<export_country_dataRaw.length;i++) {
        var year = export_country_dataRaw[i]['year']
        
        if (selectionYear.includes(year)) {}
        else {
            selectionYear.push(year)
        }
    };

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

    svgLine
        .append("g")
        .attr("class", "line1_yAxis")
        .call(d3.axisLeft(y1));

    // Add second Y-axis
    var y2 = d3.scaleLinear()
        .domain([30, d3.max(indicator_lineData, function(d) { return d.indicator_price; })])
        .range([ line_height, 0 ]);

    svgLine
        .append("g")
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