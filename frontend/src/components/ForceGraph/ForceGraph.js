// This component, 'ForceGraph', is a React component that utilizes the 'react-force-graph-2d'
// library to render a 2D force-directed graph visualization. It takes graph data as a prop
// and customizes the appearance of nodes and their labels.

// Import the 'react-force-graph-2d' library.
import ForceGraph2D from "react-force-graph-2d";

// Define the 'ForceGraph' functional component.
const ForceGraph = (props) => {
  return (
    // Render a 'ForceGraph2D' component, passing in the provided 'props.data' as the graph data.
    // Customize the appearance and behavior of nodes and labels using 'nodeCanvasObject'
    // and 'nodePointerAreaPaint' functions.
    <ForceGraph2D
      graphData={props?.data} // Set the graph data from the 'props' object.
      nodeAutoColorBy="group" // Automatically color nodes based on their 'group' property.
      nodeCanvasObject={(node, ctx, globalScale) => {
        // Function to customize the appearance of individual nodes.
        const label = node.name || node.id; // Get the node label or ID.
        const fontSize = 16 / globalScale; // Calculate the font size based on the global scale.
        ctx.font = `${fontSize}px Sans-Serif`; // Set the font size and family.

        // Calculate the dimensions of the background rectangle for the label.
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(
          (n) => n + fontSize * 0.2
        ); // Add some padding to the dimensions.

        // Fill the background rectangle with a semi-transparent white color.
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          ...bckgDimensions
        );

        // Set text alignment and color, then render the label in the center of the node.
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = node.color; // Use the node's color for the label.
        ctx.fillText(label, node.x, node.y);

        // Store the background dimensions for potential reuse.
        node.__bckgDimensions = bckgDimensions;
      }}
      nodePointerAreaPaint={(node, color, ctx) => {
        // Function to customize the appearance of the node's pointer area.
        ctx.fillStyle = color; // Set the provided color.
        const bckgDimensions = node.__bckgDimensions;

        // Fill the pointer area with the specified color if dimensions are available.
        bckgDimensions &&
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            ...bckgDimensions
          );
      }}
    />
  );
};

// Export the 'ForceGraph' component as the default export.
export default ForceGraph;
