import React, { useRef } from "react";
import styles from "./card.module.scss";
import cx from "classnames";
import makeAPICall from "../../../../../api/apiClient";
import { useNavigate } from "react-router-dom";
const Card = ({
  title = "",
  content = "",
  iconPosition = "right",
  icon = null,
  className,
}) => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const handleImport = () => {
    console.log("handle");
    if (title === "Audio") {
      fileInputRef.current.accept = "audio/*";
    } else if (title === "Transcription") {
      fileInputRef.current.accept = ".txt";
    } else if (title === "JSON File") {
      fileInputRef.current.accept = "application/json";
    }
    fileInputRef.current.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      //Integrate the upload api here
      console.log("Selected file:", file);
      try {
        const response = await makeAPICall({
          method: "POST",
          endpoint: "/api/user/upload",
          payload: { fileb: file },
          contentType: "multipart/form-data",
        });
        navigate("/archive");
        console.log("Response", response);
      } catch (e) {
        //error message
      }
    }
  };
  return (
    <div
      className={cx(styles.card, className, {
        [styles.csCard]: title === "Real-Time",
      })}
      onClick={
        title === "Audio" || title === "Transcription" || title === "JSON File"
          ? handleImport
          : null
      }
    >
      {title === "Real-Time" ? (
        <div className={styles.cSoon} style={{ opacity: 1 }}>
          {" "}
          Coming Soon!{" "}
        </div>
      ) : null}
      {title === "Audio" ||
      title === "Transcription" ||
      title === "JSON File" ? (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
      ) : null}

      {iconPosition && icon && (
        <div
          className={cx(
            styles.card_ctaicon,
            { [styles.ctaleft]: iconPosition === "left" },
            { [styles.ctatop]: iconPosition === "top" }
          )}
        >
          {icon}
        </div>
      )}
      <div className={styles.card_title}>{title}</div>
      <div className={styles.card_text}>{content}</div>
    </div>
  );
};

export default Card;
