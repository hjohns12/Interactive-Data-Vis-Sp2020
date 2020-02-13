var format = d3.format(",.0f");

d3.csv("../../data/peds_agg.csv", d3.autoType).then(data => {
    console.log(data);

const width = window.innerWidth * 0.8,
    height = window.innerHeight / 2,
    paddingInner = 0.2;
    margin = {top: 20, bottom: 20, left: 60, right: 60};

  /** SCALES */
  // reference for d3.scales: https://github.com/d3/d3-scale
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.avg_peds)])
    .range([margin.left, width - margin.right])

  const yScale = d3
    .scaleBand()
    .domain(data.map(d => d.mon_year))
    .range([margin.top, height - margin.bottom])
    .paddingInner(paddingInner);

  // reference for d3.axis: https://github.com/d3/d3-axis
  const xAxis = d3.axisLeft(yScale).ticks(data.length);

  /** MAIN CODE */
  const svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const title = svg.append("title");

    title
      .attr("class", "plot-title")
      .text("Brooklyn Bridge Pedestrian Counts and Conditions");

  // append bars
  const rect = svg
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("y", d => yScale(d.mon_year))
    .attr("x", margin.left)
    .attr("width", d => xScale(d.avg_peds))
    .attr("height", yScale.bandwidth())
    .attr("fill", "pink")

  // append text
  const text = svg
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("class", "label")
    // this allows us to position the text in the center of the bar
    .attr("x", d => xScale(d.avg_peds))
    .attr("y", d => yScale(d.mon_year)) 
    .text(d => format(d.avg_peds))
    .attr("dy", "1.25em");

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left})`)
    .call(xAxis);

});