/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;

/**
 * APPLICATION STATE
 * */
let state = {
  data: null,
  hover: null,
  mousePosition: null,
};

/**
 * LOAD DATA
 * */
d3.json("../../data/flare.json", d3.autotype).then(data => {
  state.data = data;
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  const container = d3.select("#d3-container").style("position", "relative");

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  tooltip = container
    .append("div")
    .attr("class", "tooltip")
    .attr("width", 100)
    .attr("height", 100)
    .style("position", "absolute");
  
  const colorScale = d3.scaleOrdinal(d3.schemeDark2);

  // + CREATE YOUR ROOT HIERARCHY NODE
  const root = d3
    .hierarchy(state.data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);
  
  // console.log("root leaves", root.leaves());
  // console.log("root descendants", root.descendants());


  // + CREATE YOUR LAYOUT GENERATOR
  const circlepack = d3
    .pack()
    .size([width, height])
    .padding(1);

  // + CALL YOUR LAYOUT FUNCTION ON YOUR ROOT DATA
  circlepack(root);

  // + CREATE YOUR GRAPHICAL ELEMENTS
  const leaf = svg
    .selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`)
  
  leaf 
    .append("circle")
    .attr("r", d => d.r)
    .attr("fill", d => {
      const level1Ancestor = d.ancestors().find(d => d.depth ===1);
      return colorScale(level1Ancestor.data.name);
    })
    .on("mouseover", function(d) {
      d3.select(this).style("opacity", .3);
      state.hover = {
        translate: [
          d.x + 1,
          d.y - 700,
        ],
        name: d.data.name,
        value: d.data.value,
        title: `${d
            .ancestors()
            .reverse()
            .map(d => d.data.name)
            .join("/")}`,
      };
      draw(); 
    })
    .on("mouseout", function(d) {
      d3.select(this).style("opacity", 1);
    });
  draw();
  }

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  if (state.hover) {
    tooltip
      .html(
        `
        <div>Name: ${state.hover.name}</div>
        <div>Value: ${state.hover.value}</div>
        <div>Hierarchy Path: ${state.hover.title}</div>
      `
      )
      .transition()
      .duration(300)
      .style(
        "transform",
        `translate(${state.hover.translate[0]}px,${state.hover.translate[1]}px)`
      );
  }
}
