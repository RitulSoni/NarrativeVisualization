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

// Processing data
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


// Drawing chart
async function drawBubbleChart() {
  d3.select("#bubbleChart").selectAll("*").remove(); // Clear previous chart

  const data = await processData();
  
  const groupedData = d3.group(data, d => d.OCC_TITLE);

  let jobLossData = Array.from(groupedData, ([key, value]) => {
    var sortedValues = value.sort((a,b) => d3.ascending(a.YEAR, b.YEAR));
    var jobChange = sortedValues[sortedValues.length - 1].TOT_EMP - sortedValues[0].TOT_EMP;
    var percentageChange = (jobChange / sortedValues[0].TOT_EMP) * 100; // Calculate the percentage change
    return { 
      job: key, 
      startYear: sortedValues[0].YEAR, 
      endYear: sortedValues[sortedValues.length - 1].YEAR, 
      startEmployment: sortedValues[0].TOT_EMP, // Added startEmployment
      endEmployment: sortedValues[sortedValues.length - 1].TOT_EMP, // Added endEmployment
      percentageChange: percentageChange 
    };
});

  jobLossData = jobLossData.sort((a,b) => d3.ascending(a.percentageChange, b.percentageChange)).slice(0, 10);

  const svgWidth = window.innerWidth * 0.8, // Adjust as needed
        svgHeight = window.innerHeight * 0.5, // Adjust as needed
        margin = {top: 60, right: 40, bottom: 60, left: 650},
        width = svgWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom;

  const svg = d3.select("#bubbleChart")
                .attr("width", svgWidth)
                .attr("height", svgHeight)
                .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xScale = d3.scaleLinear().range([0, width]),
      yScale = d3.scaleBand().range([height, 0]).padding(0.1),
      rScale = d3.scaleSqrt().range([1, 30]), // Increased bubble size range
      colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Added color scale

  xScale.domain([80, Math.max(Math.abs(d3.min(jobLossData, d => d.percentageChange)), d3.max(jobLossData, d => d.percentageChange))]);
  yScale.domain(jobLossData.map(d => d.job));
  rScale.domain([0, Math.max(Math.abs(d3.min(jobLossData, d => d.percentageChange)), d3.max(jobLossData, d => d.percentageChange))]);


  // Adjust x axis
  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale).tickFormat(d3.format(".2s")).tickSize(10)) // Adjust tick size
      .selectAll("text")  
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)")  
      .style("font-size", "14px"); // Adjust label size
  g.select(".domain")
      .style("stroke-width", "2"); // Adjust axis line thickness
      
  // If you also want to adjust the font size of the axis labels, you can do so as follows:
  g.append("text") // More descriptive label
      .attr("x", width / 2)
      .attr("y", 450)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .style("font-size", "18px") // Adjust this value
      .text("Percentage Change in Employment");

  // Adjust y axis
  var yAxis = g.append("g")
      .call(d3.axisLeft(yScale)); // Generate y-axis

  yAxis.selectAll("text")  
      .style("font-size", "14px"); // Adjust label size

  yAxis.select(".domain")
      .style("stroke-width", "2"); // Adjust axis line thickness

  g.append("text") // More descriptive label
      .attr("x", -height / 2)
      .attr("y", -550)
      .attr("transform", "rotate(-90)")
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .style("font-size", "18px") // Adjust this value
      .text("Job Titles");

      



      //This is the top title 
  g.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text("Top 10 Job Losses");




  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  function handleMouseOver(event, d) {
    d3.select(event.currentTarget)
      .style("fill", "darkblue");
    tooltip.transition()
      .duration(200)
      .style("opacity", .9);
    tooltip.html("Job: " + d.job 
                  + "<br>From " + d.startYear + " to " + d.endYear 
                  + "<br>Starting Total Employed in " + d.startYear + ": " + d.startEmployment // Added this line
                  + "<br>Total Employed in " + d.endYear + ": " + d.endEmployment // Added this line
                  + "<br>Percentage change: " + d.percentageChange.toFixed(2) + "%")
      .style("left", (event.pageX + 30) + "px")
      .style("top", (event.pageY) + "px");
  }
  
  function handleMouseOut(event, d) {
    d3.select(event.currentTarget)
      .style("fill", d => colorScale(d.job)); // Use color scale
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
  }
  // Here we are defining the ordinal suffix for each rank
  function ordinalSuffix(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
  }

  g.selectAll("circle")
    .data(jobLossData)
    .join("circle")
    .attr("cx", d => xScale(Math.abs(d.percentageChange)))
    .attr("cy", d => yScale(d.job))
    .attr("r", d => rScale(Math.abs(d.percentageChange)))
    .style("fill", d => colorScale(d.job))
    .style("opacity", 0.8)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", d => {
      console.log("You clicked on job: " + d.job);
    });

  // Add the rank annotations
  g.selectAll(".rank")
    .data(jobLossData)
    .join("text")
    .attr("class", "rank")
    .attr("x", d => xScale(Math.abs(d.percentageChange)))
    .attr("y", d => yScale(d.job))
    .text((d, i) => ordinalSuffix(i+1))
    .attr("text-anchor", "middle")
    .style("font-size", "15px")
    .style("fill", "black");
}

drawBubbleChart();

window.addEventListener("resize", drawBubbleChart);
