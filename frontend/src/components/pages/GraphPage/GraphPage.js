import React, { useEffect, useState } from "react";
import styles from "./GrapghePage.module.scss";
import Graph from "./components/Graph";
import Box from "./components/Box";
import graphData from "./graphData.js";
import { ReactComponent as Logo } from "../../../assets/images/icons/logo.svg";
import { useParams } from "react-router-dom";
import makeAPICall from "../../..//api/apiClient.js";
import { useNavigate } from "react-router-dom";
import Button from "../../ui-elements/Button/Button";
import { Link } from "react-router-dom";

const GraphPage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const { route_id } = useParams();
  console.log("id", route_id);
  useEffect(() => {
    const fetchData = async () => {
      try {
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
        <Logo onClick={() => navigate("/")} />
        <span onClick={() => navigate("/")}>Graph</span>
        <div className={styles.title}>
          <div className={styles.buttonWrapper}>
            <Button
               className={styles.customLink}
               variant="outlined"
               size="medium"
             >
              <Link to="/archive" className={styles.customLink}>
                Archive
              </Link>
            </Button>
          </div>
          <div className={styles.container}>
            <div className={styles.discussionText}>Front end Discussion</div>
            <div className={styles.graphContainer}>
              <div className={styles.graph}>{data && <Graph data={data} />}</div>
              <Box />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphPage;
