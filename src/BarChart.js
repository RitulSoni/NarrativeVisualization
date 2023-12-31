// Assign a unique color to each occupation once
let colorAssignments = {};

// Load the data
async function drawBarChart(baseYear, latestYear, title) {
  d3.select("#barChart").selectAll("*").remove(); // Clear previous chart
  let rawData = await d3.csv('data/Adjusted CSV.csv');
  rawData = rawData.filter(d => d.OCC_TITLE !== "All Occupations")
                   .map(d => ({year: +d.YEAR, occupation: d.OCC_TITLE, tot_emp: +d.TOT_EMP}));

  const percentChangeData = calculatePercentChange(rawData, baseYear, latestYear);

  


  const svgWidth = window.innerWidth * 0.9, // Adjust as needed
  svgHeight = window.innerHeight * 0.8, // Adjust as needed
  margin = {top: 80, right: 200, bottom: 400, left: 100},
  width = svgWidth - margin.left - margin.right,
  height = svgHeight - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select("#barChart")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add chart title
  svg.append("text")
     .attr("x", width / 2)             
     .attr("y", 0 - (margin.top / 2))
     .attr("text-anchor", "middle")  
     .style("font-size", "24px") 
     .style("font-weight", "bold")  
     .text(title);

  // Create scales
  const xScale = d3.scaleBand().range([0, width]).padding(0.2),
        yScale = d3.scaleLinear().range([height, 0]),
        colorScale = d3.scaleOrdinal(d3.schemeCategory10); // For different colors

  // Assign colors to occupations if they haven't been assigned yet
  percentChangeData.forEach(d => {
    if (!colorAssignments[d.occupation]) {
      colorAssignments[d.occupation] = colorScale(d.occupation);
    }
  });

  // Define axes
  const xAxis = d3.axisBottom(xScale),
        yAxis = d3.axisLeft(yScale);

  // Define domains
  xScale.domain(percentChangeData.map(d => d.occupation));
  yScale.domain([0, d3.max(percentChangeData, d => d.percent_change)]);

  // Add X axis
  svg.append("g")
     .attr("transform", `translate(0,${height})`)
     .style("font-size", "16px") 
     .style("stroke-width", "2")
     .call(xAxis)
     .selectAll("text")
     .attr("transform", "translate(-10,0)rotate(-45)")
     .style("text-anchor", "end");

  // Add Y axis
  svg.append("g")
     .style("font-size", "16px")
     .style("stroke-width", "2")
     .call(yAxis);

  // Add X axis label
  svg.append("text")
     .attr("transform", `translate(${width/2},${height + margin.bottom - 200})`)
     .style("text-anchor", "middle")
     .style("font-size", "20px") 
     .text("Occupations");
     

  // Add Y axis label
  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 0 - margin.left)
     .attr("x", 0 - (height / 2))
     .attr("dy", "1em")
     .style("text-anchor", "middle",)
     .style("font-size", "20px") 
     .text("Percent Change in Total Employed"); 

  // Define the tooltip
  const tooltip = d3.select("body").append("div") 
    .attr("class", "tooltip") 
    .style("opacity", 0)
    .style("font-size", "14px");
  // Add bars
  let bars = svg.selectAll(".bar")
    .data(percentChangeData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.occupation))
    .attr("width", xScale.bandwidth())
    .attr("y", d => yScale(d.percent_change))
    .attr("height", d => height - yScale(d.percent_change))
    .attr("fill", d => colorAssignments[d.occupation]); // Use the color assignments here

    bars.on("mouseover", function(event, d) { 
      d3.select(this).style("fill", "darkblue");
      tooltip.transition()
          .duration(200)
          .style("opacity", .9);
      tooltip.html("Occupation: " + d.occupation 
          + "<br>From " + d.baseYear + " to " + d.latestYear 
          + "<br>Starting Total Employed in " + d.baseYear + ": " + d.startEmployment
          + "<br>Total Employed in " + d.latestYear + ": " + d.endEmployment
          + "<br>Percent Change: " + d.percent_change.toFixed(2) + "%")
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", function(d, i) {
      d3.select(this).style("fill", function() {
      return colorAssignments[d.occupation]; // Reset bar color to its original color
      });
      tooltip.transition()
          .duration(500)
          .style("opacity", 0);
  });
}
function calculatePercentChange(data, baseYear, latestYear) {
  const pivotData = {};
  data.forEach(d => {
    if (!(d.occupation in pivotData)) {
        pivotData[d.occupation] = {};
    }
    pivotData[d.occupation][d.year] = d.tot_emp;
  });

  const percentChangeData = [];
  for (let title in pivotData) {
    const years = Object.keys(pivotData[title]).map(Number);

    // Filter out years that don't match the baseYear or latestYear
    const validYears = years.filter(year => year === baseYear || year === latestYear);

    if (validYears.length === 2) {
        const changePercent = (pivotData[title][latestYear] - pivotData[title][baseYear]) / pivotData[title][baseYear] * 100;
        const startEmployment = pivotData[title][baseYear];
        const endEmployment = pivotData[title][latestYear];
        percentChangeData.push({
            occupation: title,
            percent_change: changePercent,
            startEmployment: startEmployment,
            endEmployment: endEmployment,
            baseYear: baseYear,
            latestYear: latestYear
        });
    }
  }

  percentChangeData.sort((a, b) => b.percent_change - a.percent_change);
  return percentChangeData.slice(0, 10);
}



function updateChart(baseYear, latestYear, title) {
  d3.select("#barChart").selectAll("*").remove();
  drawBarChart(baseYear, latestYear, title);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  document.getElementById("filter20").addEventListener("click", function() { 
    updateChart(2002, 2022, "Past 20 Years Occupations with Greatest % Growth in Employment"); 
  });
  document.getElementById("filter10").addEventListener("click", function() { 
    updateChart(2012, 2022, "Past 10 Years Occupations with Greatest % Growth in Employment");
  });
  document.getElementById("filter5").addEventListener("click", function() { 
    updateChart(2017, 2022, "Past 5 Years Occupations with Greatest % Growth in Employment");
  });

  drawBarChart(2002, 2022, "Top 10 Occupations with Greatest % Growth in Employment in the Past 20 Years");
});

window.addEventListener("resize", () => {
  drawBarChart(2002, 2022, "Top 10 Occupations with Greatest % Growth in Employment in the Past 20 Years");
});
