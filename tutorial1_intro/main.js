d3.csv("../data/BrooklynBridgePeds.csv").then(data => {
    console.log("data", data);

const table = d3.select("#d3-table");

  /** HEADER */
const header = table.append("thead");

header
    .append("tr")
    .append("th")
    .attr("colspan", "10")
    .text("Brooklyn Bridge Pedestrian Counts and Conditions");

header
    .append("tr")
    .attr("class", "column-names")
    .selectAll("th") 
    .data(data.columns)
    .join("td")
    .text(d => d); 

const rows = table.append("tbody")
    .selectAll("tr")
    .data(data)
    .join("tr")
    .attr("id", d => d.Temp > 65 ? 'warm-out' : null)
    .attr("class", function(d) {
       if (d.Towards_Manhattan > d.Towards_Brooklyn) {return "manhat"} // strange behavior here. sometimes correct but sometimes not! 
       else {return "bk"}
   });

//want one td per column 
rows
    .selectAll("td")
    .data(d => Object.values(d))
    .join("td")
    .attr("class", d => +d > 1000 ? 'high' : null)
    .attr("id", d => d === 'clear-day' ? 'nice-day' : null)
    .style("background-color", d => d > 2000 ? '#A6178E' : null)
    .text(d => d);



});