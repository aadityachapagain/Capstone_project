import React, { useState } from "react";
import styles from "../GrapghePage.module.scss";

const Box = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className={styles.boxcontainer}>
      <div className={styles.dropdown}>
        <button className={styles.dropdownButton} onClick={toggleDropdown}>
          Transcript
        </button>
        {isOpen && (
          <div className={styles.dropdownContent}>
            <div className={styles.card}>
              <p>{data ? data : ""}</p>
              <button className={styles.closeButton} onClick={toggleDropdown}>
                &#10005;
              </button>
            </div>
          </div>
        )}
      </div>{" "}
    </div>
  );
};

export default Box;
