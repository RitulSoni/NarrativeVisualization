async function drawLineChart() {
      // Load and process data
      let data = await d3.csv('data/Adjusted CSV.csv');
      data = data.filter(d => d.OCC_TITLE === 'Telephone Operators');
      data = data.map(d => ({year: +d.YEAR, value: +d.TOT_EMP}));
    
      // Set up SVG
      const svg = d3.select("#TelephoneOP"),
            margin = {top: 70, right: 200, bottom: 50, left: 100},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
    
      const g = svg.append("g")
                   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
      svg.attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom);
    
      // Adding Title
      svg.append("text")
         .attr("x", width / 2)             
         .attr("y", 30)
         .attr("text-anchor", "middle")  
         .style("font-size", "20px") 
         .text("The Decline in Telephone Operator Jobs");
    
      // Set up scales
      const xScale = d3.scaleLinear().range([0, width]),
            yScale = d3.scaleLinear().range([height, 0]);
    
      xScale.domain(d3.extent(data, d => d.year));
      yScale.domain(d3.extent(data, d => d.value));
    
      // Set up line generator
      const line = d3.line()
                     .x(d => xScale(d.year))
                     .y(d => yScale(d.value));
    
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
    
      // Add Y axis
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
       .text("Number of Telephone Operators");
    
      // Add line path
      const path = g.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", "orange")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width", 4.5)
                    .attr("class", "line")
                    .attr("d", line);
    
// Animation
const totalLength = path.node().getTotalLength();
let animated = false;

path.attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", -totalLength);

    
 // Intersection Observer
 const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !animated) {
      path.transition()
          .duration(4000)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0)
          .on("end", () => {  // After animation ends, add annotation.
            const annotationData = [{
              note: {
                label: "2016 marked the beginning of the complete obsoleteness of Telephone Operators",
                title: "Important Year"
              },
              x: xScale(2016),
              y: yScale(data.find(d => d.year === 2016).value),
              dy: -50,
              dx: 50
            }, {
              note: {
                label: "In 2022, there were approximately 4000 Telephone Operators in the US",
                title: "Few Operators"
              },
              x: xScale(2022),
              y: yScale(data.find(d => d.year === 2022).value),
              dy: -50,
              dx: 50
            }];

            const makeAnnotations = d3.annotation()
              .type(d3.annotationCalloutCircle)
              .annotations(annotationData)
              .accessors({
                x: d => d.x,
                y: d => d.y
              })
              .accessorsInverse({
                year: d => xScale.invert(d.x),
                value: d => yScale.invert(d.y)
              });

            g.append("g")
              .attr("class", "annotation-group")
              .call(makeAnnotations);
          });

      animated = true;
    }
  });
});

observer.observe(svg.node());
}

drawLineChart();