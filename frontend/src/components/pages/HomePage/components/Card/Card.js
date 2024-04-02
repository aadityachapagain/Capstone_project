import React, { useRef } from "react";
import styles from "./card.module.scss";
import cx from "classnames";

const Card = ({
  title = "",
  content = "",
  iconPosition = "right",
  icon = null,
  className,
}) => {
  const fileInputRef = useRef(null);

  const handleImport = () => {
    console.log("handle");
    if (title === "Audio") {
      fileInputRef.current.accept = "audio/*";
    } else if (title === "Transcription") {
      fileInputRef.current.accept = ".txt";
    }
    fileInputRef.current.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      //Integrate the upload api here
      console.log("Selected file:", file);
    }
  };
  return (
    <div
      className={cx(styles.card, className)}
      onClick={
        title === "Audio" || title === "Transcription" ? handleImport : null
      }
    >
      {title === "Audio" || title === "Transcription" ? (
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
