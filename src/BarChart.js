async function drawBarChart(timeFilter) {
  // Load and process data
  let rawData = await d3.csv('data/Adjusted CSV.csv');
  rawData = rawData.filter(d => d.OCC_TITLE !== "All Occupations")
                   .map(d => ({year: +d.YEAR, occupation: d.OCC_TITLE, tot_emp: +d.TOT_EMP}));

  const percentChangeData = calculatePercentChange(rawData, timeFilter);

  // Set up SVG
  const svg = d3.select("#barChart"),
      margin = {top: 50, right: 200, bottom: 400, left: 100},
      width = 1260 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;
  
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  svg.attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom);

  // Set up scales
  const xScale = d3.scaleBand().range([0, width]).padding(0.2),
      yScale = d3.scaleLinear().range([height, 0]);
  
  xScale.domain(percentChangeData.map(d => d.occupation));
  yScale.domain([0, d3.max(percentChangeData, d => d.percent_change)]);

  // Add X axis
  g.append("g")
   .attr("transform", `translate(0,${height})`)
   .style("font-size", "16px") 
   .style("stroke-width", "2")
   .call(d3.axisBottom(xScale))
   .selectAll("text")
   .attr("transform", "translate(-10,0)rotate(-45)")
   .style("text-anchor", "end");

  // Add Y axis
  g.append("g")
   .style("font-size", "16px")
   .style("stroke-width", "2")
   .call(d3.axisLeft(yScale));

  // Add X axis label
  svg.append("text")             
    .attr("transform", `translate(${width/2} , ${height + margin.top + 300})`)
    .style("text-anchor", "middle")
    .text("Occupations");

  // Add Y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left - 80)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Percent % Change"); 

  // Add chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text(`Top Occupations by Change Over Last ${timeFilter} Years`);

  // Add bars
  g.selectAll("mybar")
   .data(percentChangeData)
   .enter()
   .append("rect")
   .attr("x", d => xScale(d.occupation))
   .attr("y", d => yScale(d.percent_change))
   .attr("width", xScale.bandwidth())
   .attr("height", d => height - yScale(d.percent_change))
   .attr("fill", "#3E5F8A"); // Change color to a shade of blue
}

// Calculate percent change over a given number of years
function calculatePercentChange(data, yearDiff) {
  const pivotData = {};
  data.forEach(d => {
      if (!(d.occupation in pivotData)) {
          pivotData[d.occupation] = {};
      }
      pivotData[d.occupation][d.year] = d.tot_emp;
  });

  const percentChangeData = [];
  for (let title in pivotData) {
      const years = Object.keys(pivotData[title]);
      const latestYear = Math.max(...years);
      const baseYear = latestYear - yearDiff;

      if (baseYear in pivotData[title]) {
          const changePercent = (pivotData[title][latestYear] - pivotData[title][baseYear]) / pivotData[title][baseYear] * 100;
          percentChangeData.push({occupation: title, percent_change: changePercent});
      }
  }

  // Sort and keep only top 10
  percentChangeData.sort((a, b) => b.percent_change - a.percent_change);
  return percentChangeData.slice(0, 10);
}

function updateChart(timeFilter) {
  d3.select("#barChart").selectAll("*").remove();
  drawBarChart(timeFilter);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  // Your code
  document.getElementById("filter20").addEventListener("click", function() { updateChart(20); });
  document.getElementById("filter10").addEventListener("click", function() { updateChart(10); });
  document.getElementById("filter5").addEventListener("click", function() { updateChart(5); });
  
  drawBarChart(20); // Default to 20 year filter
});