import React, { useEffect, useState } from "react";
import styles from "./GrapghePage.module.scss";
import Graph from "./components/Graph";
import Box from "./components/Box";
import graphData from "./graphData.js";
import { ReactComponent as Logo } from "../../../assets/images/icons/logo.svg";
import { useParams } from "react-router-dom";
import makeAPICall from "../../..//api/apiClient.js";

const GraphPage = () => {
  const [data, setData] = useState(null);
  const { route_id } = useParams();
  console.log("id", route_id);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = graphData;
        // //const jsonData = await response.json();
        // setData(...response);
        const fetchData = async () => {
          try {
            const response = await makeAPICall({
              method: "GET",
              endpoint: "/api/get/mindmap",
              params: {
                transcript_id: route_id,
              },
            });
            setData(response);
          } catch (error) {
            // Handle error
            console.error("Error fetching data:", error);
          }
        };
        fetchData();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Logo />
        <span>Graph</span>
        <div className={styles.title}>
          Front end Discussion
          <div className={styles.graphContainer}>
            <div className={styles.graph}>{data && <Graph data={data} />}</div>
            <Box />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphPage;
