import React, { useEffect, useState } from "react";
import styles from "./GrapghePage.module.scss";
import Graph from './components/Graph';
import Box from './components/Box';

import { ReactComponent as Logo } from "../../../assets/images/icons/logo.svg";


const GraphPage = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('data.json');
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
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

                    <div className={styles.graph}>
                        {data && <Graph data={data} />}
                    </div>
                    <Box />
                </div>
            </div>
            </div>



        </div>
    );
};

export default GraphPage;
