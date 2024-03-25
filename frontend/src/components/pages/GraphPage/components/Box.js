import React, { useState } from "react";
import styles from "../GrapghePage.module.scss";

const Box = () => {
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
                    Front end Discussion
                </button>
                {isOpen && (
                    <div className={styles.dropdownContent}>
                        <div className={styles.card}>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget urna nec nisi aliquam
                                consectetur ut ac magna. Maecenas dapibus sem at luctus vehicula. Integer at dolor vel leo
                                accumsan elementum.
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget urna nec nisi aliquam
                                consectetur ut ac magna. Maecenas dapibus sem at luctus vehicula. Integer at dolor vel leo
                                accumsan elementum.
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget urna nec nisi aliquam
                                consectetur ut ac magna. Maecenas dapibus sem at luctus vehicula. Integer at dolor vel leo
                                accumsan elementum.
                            </p>
                            <button className={styles.closeButton} onClick={toggleDropdown}>
                                &#10005;
                            </button>
                        </div>
                    </div>
                )}
            </div>    </div>

    );
};

export default Box;
