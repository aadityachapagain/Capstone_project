import React, { useState, useEffect } from "react";
import styles from "./ArchivePage.module.scss";
import Button from "../../ui-elements/Button/Button";
import { ReactComponent as Logo } from "../../../assets/images/icons/logo.svg";
import {
  Table,
  Header,
  HeaderRow,
  Body,
  Row,
  HeaderCell,
  Cell,
} from "@table-library/react-table-library/table";
import makeAPICall from "../../..//api/apiClient.js";
import { useNavigate } from "react-router-dom";

const ArchivePage = () => {
  const uploadNew = () => {
    navigate("/");
  };
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [data, setData] = useState({ nodes: [] });
  const [loading, setLoading] = useState(false);

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await makeAPICall({
          method: "GET",
          endpoint: "/api/get/filelist",
        });
        console.log("response", response);
        setData({ nodes: response });
      } catch (error) {
        // Handle error
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Clean up function (optional)
    return () => {
      // Any cleanup code here
    };
  }, []);

  const filteredData = {
    nodes: data.nodes.filter((item) =>
      item.filename.toLowerCase().includes(search.toLowerCase())
    ),
  };
  const handleRowClick = (routeId) => {
    navigate(`/archive/${routeId}`); // Navigate to /archive/:route_id
  };
  if (data?.nodes?.length === 0) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Logo />
        <span>Archive</span>
        <Button
          className={styles.Button}
          variant="outlined"
          size="medium"
          onClick={uploadNew}
        >
          New
        </Button>
      </div>
      <label htmlFor="search">
        <input
          id="search"
          type="text"
          name="search"
          onChange={handleSearch}
          placeholder="Search by Files Name"
          //onFocus={()=>setSearch.value=" "}
        />
      </label>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table data={filteredData}>
          {(tablelist) => (
            <>
              <Header>
                <HeaderRow>
                  <HeaderCell className={styles.th}>File</HeaderCell>
                  <HeaderCell className={styles.th}>Attendees</HeaderCell>
                  <HeaderCell className={styles.th}>Source</HeaderCell>
                  <HeaderCell className={styles.th}>Summary</HeaderCell>
                  <HeaderCell className={styles.th}>Date/Time</HeaderCell>
                  <HeaderCell className={styles.th}>Status</HeaderCell>
                </HeaderRow>
              </Header>
              <Body>
                {tablelist.map((item) => (
                  <Row
                    key={item.id}
                    item={item}
                    className={styles["td"]}
                    onClick={() => handleRowClick(item.id)}
                  >
                    <Cell>{item.filename}</Cell>
                    <Cell>{item.attendees}</Cell>
                    <Cell>{item.source}</Cell>
                    <Cell>{item.summary}</Cell>
                    <Cell>{item.datetime}</Cell>
                    <Cell>{item.status}</Cell>
                  </Row>
                ))}
              </Body>
            </>
          )}
        </Table>
      )}
    </div>
  );
};

export default ArchivePage;
