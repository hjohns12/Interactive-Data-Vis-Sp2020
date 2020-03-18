/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 3,
  default_selection = "Select an age group"

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let yAxis;
let cScale = d3.scaleOrdinal(d3.schemePaired);

const formatPercent = d3.format(".0%");

/* APPLICATION STATE */
let state = {
  data: [],
  selectedAge: null,
};

/* LOAD DATA */
// + SET YOUR DATA PATH
d3.csv("../data/voter-turnout_long.csv", d => ({
  year: new Date(d.year, 0, 1),
  type: d.type,
  age: d.age,
  perc: +d.perc, 
  year_type_age: d.yeartypeage,
})).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
})



/* INITIALIZING FUNCTION */
function init() {
  xScale = d3
    .scaleTime()
    .domain(d3.extent(state.data, d => d.year))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data, d => d.perc)])
    .range([height - margin.bottom, margin.top]);
  
  const xAxis = d3.axisBottom(xScale);
  yAxis = d3.axisLeft(yScale).tickFormat(formatPercent);

  cScale
    .domain(state.data.map(d => d.type));

  // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
  const legend_data = [
    ["Voter turnout rate", cScale("turnout_rate")],
    ["Share of the electorate", cScale("share_electorate")]
  ];

  const legend = d3.select("#legend-container")
                  .append("svg")
                  .attr("class", "legend")
                  .selectAll("g")
                  .data(legend_data)
                  .join("g")
                  .attr("transform", function(d, i) {
                      return "translate(0," + (i * 20) + ")"; 
                  });
  
  legend.append("rect")
        .attr("y", 20) 
        .attr("width", 18) 
        .attr("height", 18) 
        .style("fill", function(d) { return d[1]; }
      );
  
  
  legend.append("text")
        .attr("x", 24) 
        .attr("y", 30) 
        .attr("dy", ".35em") 
        .attr("font-size", 13)
        .text(function(d) { return d[0]; });

  // UI ELEMENT SETUP
  const selectElement = d3.select("#dropdown").on("change", function() {
    state.selectedAge = this.value; // + UPDATE STATE WITH YOUR SELECTED VALUE
    console.log("new selected age grp is", this.value);
    draw(); 
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data([
      ...Array.from(new Set(state.data.map(d => d.age))),
      default_selection,
    ])
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // + SET SELECT ELEMENT'S DEFAULT VALUE (optional)
  selectElement.property("value", default_selection);

  // + CREATE SVG ELEMENT
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Year");

  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Percentage");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  let filteredData;
  let filteredData_turnout;
  let filteredData_pop;
  let new_filteredData;
  if (state.selectedAge !== null) {
    filteredData = state.data.filter(d => d.age === state.selectedAge);
    console.log("filteredData", filteredData);
    filteredData_turnout = filteredData.filter(d => d.type === "turnout_rate");
    filteredData_pop = filteredData.filter(d => d.type === "share_electorate");
    new_filteredData = [{type: "turnout_rate", data: filteredData_turnout},
                        {type: "share_electorate", data: filteredData_pop}]
  }


  yScale.domain([0, d3.max(filteredData, d => d.perc)]);

  d3.select("g.y-axis")
    .transition()
    .duration(1000)
    .call(yAxis.scale(yScale));

  const lineFunc = d3
    .line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.perc));

  const areaFunc = d3
    .area()
    .x(d => xScale(d.year))
    .y0(height - margin.bottom)
    .y1(d => yScale(d.perc));

  const dot = svg 
    .selectAll(".dot")
    .data(filteredData, d => d.year)
    .join(
      enter =>
        enter 
          .append("circle")
          .attr("class", "dot")
          .attr("r", radius)
          .attr("cy", height - margin.bottom)
          .attr("cx", d => xScale(d.year)),
        update => update,
        exit =>
        exit.call(exit =>
          // exit selections -- all the `.dot` element that no longer match to HTML elements
          exit
            .transition()
            // .delay(d => d.year_type_age) //commented this out because otherwise the dots all stayed
            .duration(500)
            .attr("cy", height - margin.bottom)
            .remove()
        )
    )
    .call(
      selection => 
        selection 
          .transition()
          .duration(1000)
          .attr("cy", d => yScale(d.perc))
    );

    // this stopped showing up, come back to it
    const line = svg
      .selectAll("path.trend")
      .data([filteredData])
      .join(
        enter => 
          enter
            .append("path")
            .attr("class", "trend")
            .attr("opacity", 0),
        update => update, // pass through the update selection
        exit => exit.remove()
      )
      .call(selection =>
        selection 
          .transition()
          .duration(1000)
          .attr("opacity", 1)
          .attr("stroke", "red")
        );
      
    const area = svg  
        .selectAll("path.area")
        .data(new_filteredData) 
        .join(
            enter =>
              enter
                .append("path")
                .attr("class", "area")
                .attr("opacity", 0),
                update => update,
                exit => exit.remove()
        )
      .call(selection =>
          selection
            .transition()
            .duration(1500)
            .attr("opacity", 1)
            .attr("fill", function(d, i) {["red", "blue"][i]})
            // .attr("fill", function (d){ return cScale(d.type); })
            .attr("fill", d => cScale(d.type))
            .attr("d", d => areaFunc(d["data"]))
          );

      // should add a tooltip on hover with year, midterm/general, value
}
