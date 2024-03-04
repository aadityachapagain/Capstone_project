import React from "react";
import styles from "./card.module.scss";
import cx from "classnames";

const Card = ({
  title = "",
  content = "",
  iconPosition = "right",
  icon = null,
  className,
}) => {
  return (
    <div className={cx(styles.card, className)}>
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
