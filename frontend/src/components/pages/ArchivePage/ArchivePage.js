import React from "react";
import styles from "./ArchivePage.module.scss";
import Button from "../../ui-elements/Button/Button";
import {ReactComponent as Logo} from "../../../assets/images/icons/logo.svg";
import {Table,Header,HeaderRow,Body,Row,HeaderCell,Cell,} from '@table-library/react-table-library/table';
import datademo from "./datademo.json";
import makeAPICall from "../../..//api/apiClient.js";


const ArchivePage = () => {
    const upload_new = () =>{
        console.log("upload new");
    }

    const [search, setSearch] = React.useState('')

    const handleFocus = (event) =>{
        console.log("clear field")
    }

    const handleSearch =(event) =>{
        setSearch(event.target.value);
    }

    //fetch data use api
    //const datademo = makeAPICall.json()

    const data ={
        nodes:datademo.filter((item) =>
            item.file.toLowerCase().includes(search.toLowerCase())
        ),
    };

return (
    <div className={styles.root}>
        <div className={styles.header}>
            <Logo/>
            <span>Archive</span>
            <Button className={styles.Button} variant="outlined" size="medium" onClick={upload_new}>
                New
            </Button>
        </div>

        <label htmlFor="search">
            <input id="search" type="text" name="search"  
                onChange={handleSearch} 
                defaultValue="Search by Files Name" 
                //onFocus={()=>setSearch.value=" "} 
            />
        </label>

        <Table data={data} >
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
                        <Row key={item.id} item={item} className={styles['td']}>
                            <Cell>{item.file}</Cell>
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
    </div>
);
};

export default ArchivePage;
