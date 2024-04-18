import React from "react";
import styles from "../GrapghePage.module.scss";

const Modal = ({ isOpen, text, onClose }) => {
  return (
    <div className={`${styles.modal} ${isOpen ? styles.open : ""}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Modal;