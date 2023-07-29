// BarChart.js

const style = document.createElement('style');
style.innerHTML = `
.tooltip {
  position: absolute;
  text-align: center;
  width: 300px;
  height: 100px;
  padding: 2px;
  font: 14px sans-serif;
  background: lightsteelblue;
  border: 0;
  border-radius: 8px;
  pointer-events: none;
}`;
document.head.appendChild(style);

async function processData() {
  const rawData = await d3.csv('data/Adjusted CSV.csv');
  return rawData
    .filter(d => d.OCC_TITLE !== "All Occupations")
    .map(d => {
      d.TOT_EMP = +d.TOT_EMP;
      d.YEAR = +d.YEAR;
      return d;
    });
}

async function drawBarChart(timeFilter) {
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    
    const data = await processData();
    
    const filteredData = data.filter(d => d.YEAR >= timeFilter);
  
    const svg = d3.select("#barChart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
    
    const x = d3.scaleBand()
      .range([ 0, width ])
      .domain(filteredData.map(d => d.OCC_TITLE))
      .padding(0.2);
    
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.TOT_EMP)])
      .range([ height, 0]);
    
    svg.append("g")
      .call(d3.axisLeft(y));
    
    svg.selectAll("mybar")
      .data(filteredData)
      .enter()
      .append("rect")
        .attr("x", d => x(d.OCC_TITLE))
        .attr("y", d => y(d.TOT_EMP))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.TOT_EMP))
        .attr("fill", "#69b3a2")
  }
  

function updateChart(timeFilter) {
  d3.select("#barChart").selectAll("*").remove();
  drawBarChart(timeFilter);
}

document.getElementById("filter20").addEventListener("click", function() { updateChart(20); });
document.getElementById("filter10").addEventListener("click", function() { updateChart(10); });
document.getElementById("filter5").addEventListener("click", function() { updateChart(5); });

drawBarChart(20); // Default to 20 year filter
