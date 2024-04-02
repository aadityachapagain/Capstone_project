import { useEffect, useRef } from "react";
import * as d3 from "d3"; // Import the D3 library as 'd3'.

// Define a React component named 'Graph' that visualizes graph data.
const Graph = (props) => {
  const svgRef = useRef(); // Create a reference to an SVG element.

  useEffect(() => {
    const { data } = props; // Extract the 'data' prop from the component's properties.

    // Define data structures for nodes and links, and create a color scale.
    const nodes = data?.nodes; // Array of nodes.
    const links = data?.links; // Array of links connecting nodes.

    /** scaleOrdinal is a D3.js method used to create an ordinal scale.
     Ordinal scales are typically used for data that has discrete,
    non-numeric values (categories) as opposed to continuous numeric data.
    when you combine (d3.scaleOrdinal() and d3.schemeCategory10), 
    you get a color scale that can be used to assign colors to discrete 
    categories in your data. The ordinal scale created by d3.scaleOrdinal() 
    will map each category to one of the 10 distinct colors from d3.schemeCategory10
    */
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create the SVG container with a specified width and height.
    const width = 1400;
    const height = 700;
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height);

    // Calculate initial node positions in a circular layout.
    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      node.x = width / 2 + Math.cos(angle) * 850; // Adjust 850 for initial spread.
      node.y = height / 2 + Math.sin(angle) * 450; // Adjust 450 for initial spread.
    });

    // Create a force simulation for positioning nodes and links within the graph.

    // Initialize the simulation by specifying the nodes it will operate on.
    const simulation = d3
      .forceSimulation(nodes) // Specify the nodes for the simulation.

      // Define a force to control the links between nodes.
      .force(
        "link",
        d3
          .forceLink(links) // Create a force to manage links between nodes.
          .id((d) => d.id) // Define how to identify nodes in the 'links' array.
          .distance(300) // Set the desired distance between connected nodes.
      )

      // Define a force that represents the "charge" or attraction between nodes.
      .force("charge", d3.forceManyBody().strength(-50)) // Define charge force.

      // Define a force that keeps the entire simulation centered within the SVG container.
      .force("center", d3.forceCenter(width / 2, height / 2)); // Define centering force.

    // Create and style the links between nodes.
    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll()
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // Append labels to links.
    const linkLabels = svg
      .append("g")
      .selectAll()
      .data(links)
      .enter()
      .append("text")
      .text((d) => d.name)
      .attr("class", "link-label")
      .attr("text-anchor", "middle")
      .attr("font-size", 14);

    // Create and style the nodes.
    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll()
      .data(nodes)
      .join("circle")
      .attr("r", 15)
      .attr("fill", (d) => color(d.group))
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Append labels to nodes.
    const nodeLabels = svg
      .append("g")
      .selectAll()
      .data(nodes)
      .enter()
      .append("text")
      .text((d) => d.name)
      .attr("class", "node-label")
      .attr("font-size", 14)
      .attr("dx", 12)
      .attr("dy", 5)
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Update node and link positions on each tick of the simulation.
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      linkLabels
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      nodeLabels.attr("x", (d) => d.x + 12).attr("y", (d) => d.y + 5);
    });

    // Function to handle the start of node dragging.
    function dragstarted(event, d) {
      // Check if the simulation is not currently active (not running).
      if (!event.active) {
        // If the simulation is not active, set the alpha target to 0.3 and restart it.
        // This "reheating" of the simulation allows it to react to new forces.
        simulation.alphaTarget(0.3).restart();
      }

      // Store the current position of the dragged node (d) as 'd.fx' and 'd.fy'.
      // This effectively "fixes" the node's position while it's being dragged.
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Clean up the simulation when the component unmounts.
    return () => {
      simulation.stop();
    };
  }, []);

  return <svg ref={svgRef} style={{ marginTop: "20px" }}></svg>; // Render an empty SVG element with the provided reference.
};

export default Graph; // Export the 'Graph' component as the default export.
