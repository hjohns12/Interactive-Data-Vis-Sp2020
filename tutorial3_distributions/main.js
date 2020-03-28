/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5;

let svg;
let xScale;
let yScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selectedDir: "Both",
};

/* LOAD DATA */
d3.csv("../data/peds_long.csv", d3.autoType).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in 
function init() {

  xScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.count))
    .range([margin.left, width - margin.right]);
  
  yScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.temperature))
    .range([height - margin.bottom, margin.top]);
  
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  const selectElement = d3.select("#dropdown").on("change", function() {
    console.log("new value is", this.value);
    state.selectedDir = this.value;
    draw(); // re-draw the graph based on this new selection
  });

  selectElement
    .selectAll("option")
    .data(["Both", "Towards Manhattan", "Towards Brooklyn"]) 
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // + CREATE SVG ELEMENT
  svg = d3
    .select('#d3-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr('class', 'axis-label')
    .attr('x', '50%')
    .attr('dy', '3em')
    .text("Number of daily walkers");
  
  svg 
    .append("g")
    .attr('class', 'axis y-axis')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis)
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', '50%')
    .attr('dx', '-3em')
    .attr('writing-mode', 'vertical-rl')
    .text("Temperature (F)");
  
  draw();
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state
function draw() {
  let filteredData = state.data;
  if (state.selectedDir !== 'Both') {
    filteredData = state.data.filter(d => d.direction === state.selectedDir);
    console.log(filteredData);
  }
  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.name)
    .join(
      enter =>
        enter 
        .append("circle")
        .attr('class', 'dot')
        .attr('stroke', 'black')
        .attr('opacity', 0.2)
        .attr('fill', d => {
          if (d.direction === "Towards Manhattan") return "pink";
          else return "purple";
        })
        .attr("r", radius)
        .attr("cy", d => height)
        .attr("cx", d => margin.top) 
        .call(enter => enter
          .transition()
          .delay(500)
          .attr("cx", d => xScale(d.count))
          .attr("cy", d => yScale(d.temperature))
          .attr("opacity", 0.6)
        ),
    update => 
      update.call(update => 
        update
        .transition()
        .duration(50)
        .attr("stroke", "black")
        ),
    exit => 
        exit.call(exit => 
          exit
          .transition()
          .attr("opacity", 1)
          .delay(700)
          .duration(500)
          .attr("opacity", .2)
          .remove()
          )
    );
}
