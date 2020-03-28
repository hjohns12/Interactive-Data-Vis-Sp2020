/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;

/**
 * APPLICATION STATE
 * */
let state = {
  geojson: null,
  extremes: null,
  hover: {
    State: null,
    Latitude: null,
    Longitude: null,
    'Change in unusually hot days': null,
  },
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../data/usState.json"),
  d3.csv("../data/usHeatExtremes.csv", d3.autoType),
]).then(([geojson, extremes]) => {
  state.geojson = geojson;
  state.extremes = extremes;
  console.log("state: ", state);
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // create an svg element in our main `d3-container` element
  const projection = d3.geoAlbersUsa().fitSize([width, height], state.geojson);
  const path = d3.geoPath().projection(projection);

  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // + DRAW BASE MAP PATH
  svg
    .selectAll(".state")
    .data(state.geojson.features)
    .join("path")
    .attr("d", path)
    .attr("class", "state")
    .attr("fill", "transparent")
    .on("mouseover", d => {
      state.hover["State"] = d.properties.NAME;
      draw();
    });

  color = d3.scaleQuantize()
    .domain(d3.extent(state.extremes, d => d["Change in 95 percent Days"]))
    .range(["lightblue", "white", "orange"])
  
  myRadius = d3.scaleQuantize()
    .domain(d3.extent(state.extremes, d => d["Change in 95 percent Days"]))
    .range([10, 2, 10])

  const formatNumber = d3.format("d")

  const points = svg
    .selectAll("circle")
    .data(state.extremes)
    .join("circle")
    .attr("r", d => myRadius(d["Change in 95 percent Days"]))
    .attr("stroke", "black")
    .attr("fill", d => color(d["Change in 95 percent Days"]))
    .attr("cx", function(d) { 
      return projection([d.Long,d.Lat])[0];})
    .attr("cy",function(d) { 
      return projection([d.Long,d.Lat])[1];})
    .attr("changeDays", function(d) {
      return d["Change in 95 percent Days"]})
    .on("mouseover", d => {
      state.hover["Change in unusually hot days"] = formatNumber(d["Change in 95 percent Days"]);
      draw();
    })

  // + ADD EVENT LISTENERS (if you want)
  svg.on("mousemove", () => {
    // we can use d3.mouse() to tell us the exact x and y positions of our cursor
    const [mx, my] = d3.mouse(svg.node());
    // projection can be inverted to return [lat, long] from [x, y] in pixels
    const proj = projection.invert([mx, my]);
    state.hover["Longitude"] = proj[0];
    state.hover["Latitude"] = proj[1];
    draw();
  });

  draw(); // calls the draw function
}

function draw() {
  hoverData = Object.entries(state.hover);
  console.log(hoverData);

  hoverContainer = d3.select("#hover-container")
    .selectAll("div.row")
    .data(hoverData)
    .join("div")
    .attr("class", "row")
    .html(
      d => 
      d[1] ? `${d[0]}: ${d[1]}` : null
    );
  
}
