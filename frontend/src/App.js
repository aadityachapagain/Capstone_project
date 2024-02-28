// This is the main component of the application, serving as the entry point.
// It renders a user interface with options to switch between two different graph visualization styles.
import "./App.css"; // Importing the CSS file for styling.
import { useState } from "react"; // Importing the useState hook from React.
import Graph from "./components/Graph/Graph"; // Importing the Graph component.
import ForceGraph from "./components/ForceGraph/ForceGraph"; // Importing the ForceGraph component.
function App() {
  // Define the data representing nodes and links for the graph visualization.
  const data = {
    // An array of nodes, each with an 'id', 'group', and 'name'.
    // These nodes will be used to create the graph structure.
    nodes: [
      {
        id: "TestOne",
        group: 1,
        name: "Topic and Discussion One",
      },
      {
        id: "TestTwo",
        group: 1,
        name: "Topic and Discussion Two",
      },
      {
        id: "TestThree",
        group: 3,
        name: "Topic and Discussion Three",
      },
      {
        id: "TestFour",
        group: 4,
        name: "Topic and Discussion Four",
      },
      {
        id: "TestFive",
        group: 5,
        name: "Topic and Discussion Five",
      },
      {
        id: "TestSix",
        group: 6,
        name: "Topic and Discussion Six",
      },
      {
        id: "TestSeven",
        group: 7,
        name: "Topic and Discussion Seven",
      },
    ],
    // An array of links connecting nodes.
    // Each link has a 'source' and 'target' node, along with a 'value' and 'name'.
    links: [
      {
        source: "TestOne",
        target: "TestTwo",
        value: 20,
        name: "path",
      },
      {
        source: "TestTwo",
        target: "TestSeven",
        value: 20,
        name: "path",
      },

      {
        source: "TestFour",
        target: "TestTwo",
        value: 20,
        name: "path",
      },
      {
        source: "TestThree",
        target: "TestFive",
        value: 20,
        name: "path",
      },
      {
        source: "TestFive",
        target: "TestSix",
        value: 20,
        name: "path",
      },
      {
        source: "TestSix",
        target: "TestSeven",
        value: 20,
        name: "path",
      },
      {
        source: "TestFour",
        target: "TestFive",
        value: 20,
        name: "path",
      },
    ],
  };

  // Define a state variable 'graphStyle' and a function 'setGraphStyle'
  // to manage the selected graph visualization style.
  const [graphStyle, setGraphStyle] = useState("");

  return (
    // Render the main application container.
    <div className="App">
      <h1>Mind Map</h1>
      {/* Render buttons to switch between graph visualization styles. */}
      <button
        onClick={() => setGraphStyle("force")}
        style={{ marginRight: "10px" }}
      >
        React Force Graph
      </button>
      <button onClick={() => setGraphStyle("d3")}>D3 Force graph</button>
      {/* Conditionally render either the 'Graph' or 'ForceGraph' component
           based on the selected 'graphStyle' state. */}
      {graphStyle === "d3" ? (
        <Graph data={data} />
      ) : graphStyle === "force" ? (
        <ForceGraph data={data} />
      ) : null}
    </div>
  );
}

export default App;
