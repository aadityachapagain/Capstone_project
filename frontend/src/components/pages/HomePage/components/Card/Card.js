import React, { useRef, useState } from "react";
import styles from "./card.module.scss";
import cx from "classnames";
import makeAPICall from "../../../../../api/apiClient";
import { useNavigate } from "react-router-dom";
import { Toast } from "react-bootstrap";
const Card = ({
  title = "",
  content = "",
  iconPosition = "right",
  icon = null,
  className,
}) => {
  const fileInputRef = useRef(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
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
      setShowToast(true);
      setToastMessage("Uploading... Please wait!");
      try {
        const response = await makeAPICall({
          method: "POST",
          endpoint: "/api/user/upload",
          payload: { fileb: file },
          contentType: "multipart/form-data",
        });
        setShowToast(true);
        setToastMessage("Successfully uploaded. Please check in archive page");
        // navigate("/archive");
        console.log("Response", response);
      } catch (e) {
        setShowToast(true);
        setToastMessage("Failed to delete transcript");
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
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={5000}
        className={styles.toast}
        autohide
      >
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </div>
  );
};

export default Card;
