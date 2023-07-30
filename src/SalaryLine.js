let selectedMean = 'A_MEAN'; // The initial mean to show

// Toggling function
d3.select('#salaryButton').on('click', () => {
  selectedMean = selectedMean === 'A_MEAN' ? 'H_MEAN' : 'A_MEAN';
  animated = false; // Reset the animation flag
  drawLineChart(); // Redraw the chart
});

let animated = false;

async function drawLineChart() {
  let data = await d3.csv('data/Adjusted CSV.csv');
  
  data = data.filter(d => d.OCC_TITLE === 'Telephone Operators' || d.OCC_TITLE === 'Telephone operators'|| d.OCC_TITLE === 'telephone operators');
  
  // Generate separate line data for A_Mean and H_Mean
  const lineData = data.map(d => ({year: +d.YEAR, value: +d[selectedMean], tot_emp: +d.TOT_EMP}));

  const svg = d3.select("#TelephoneSalary"),
        margin = {top: 70, right: 200, bottom: 50, left: 100},
        width = 1460 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

  svg.attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom);

  // Clear the SVG
  svg.selectAll("*").remove();

  // Add new group
  const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Define scales
  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);
  const yScaleRight = d3.scaleLinear().range([height, 0]); // For the right Y axis

  // Apply scales
    // Apply scales
    xScale.domain(d3.extent(lineData, d => d.year));
    yScale.domain([0, d3.max(lineData, d => d.tot_emp)]);
    
    // Set the minimum value for the right Y axis to 12 when Hourly salary is selected
    const yScaleRightMin = selectedMean === 'H_MEAN' ? 16 : 0;
    yScaleRight.domain([yScaleRightMin, d3.max(lineData, d => d.value)]); 
  

  // Define lines
  const meanLine = d3.line().x(d => xScale(d.year)).y(d => yScaleRight(d.value));
  const totEmpLine = d3.line().x(d => xScale(d.year)).y(d => yScale(d.tot_emp));

  // Draw lines
  const path1 = g.append("path")
    .datum(lineData)
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 4.5)
    .attr("d", meanLine);
    
  const path2 = g.append("path")
    .datum(lineData)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 4.5)
    .attr("d", totEmpLine);

  // Adding Title
  g.append("text")
    .attr("x", width / 2)             
    .attr("y", -40)
    .attr("text-anchor", "middle")  
    .style("font-size", "25px") 
    .text("Telephone Operator Employment vs Wages");

  // Add X axis
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .style("font-size", "16px") 
    .style("stroke-width", "2")
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
    .append("text")
    .attr("y", 40)
    .attr("x", width / 2)
    .attr("text-anchor", "middle")
    .style("fill", "black")
    .style("font-size", "18px")
    .text("Years");

  // Add Y axis (Left)
  g.append("g")
    .style("font-size", "16px")
    .style("stroke-width", "2")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -80)
    .attr("x", -height / 2)
    .attr("dy", ".71em")
    .attr("text-anchor", "middle")
    .style("fill", "black")
    .style("font-size", "18px")
    .text("Total Employment");

  // Add Y axis (Right)
  g.append("g")
    .attr("transform", "translate(" + width + ",0)")
    .style("font-size", "16px")
    .style("stroke-width", "2")
    .call(d3.axisRight(yScaleRight))
    .append("text")
    .attr("transform", "rotate(90)")
    .attr("y", -90)
    .attr("x", height / 2)
    .attr("dy", ".71em")
    .attr("text-anchor", "middle")
    .style("fill", "black")
    .style("font-size", "18px")
    .text(selectedMean === 'A_MEAN' ? "Annual Salary" : "Hourly Salary");

  // Animation
  [path1, path2].forEach(path => {
    const totalLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", -totalLength);
  });

  // Intersection Observer
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        [path1, path2].forEach(path => {
          path.transition()
              .duration(4000)
              .ease(d3.easeLinear)
              .attr("stroke-dashoffset", 0);
        });
        animated = true;
      }
    });
  });
  
  observer.observe(svg.node()); // Start observing
}

drawLineChart();
