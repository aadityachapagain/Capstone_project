import React from "react";
import styles from "./homepage.module.scss";
import Button from "../../ui-elements/Button/Button";
import { ReactComponent as TitleIcon } from "../../../assets/images/icons/logo.svg";
import { ReactComponent as AgendaIcon } from "../../../assets/images/icons/icon_agenda.svg";
import { Card } from "./components/Card";
import { ReactComponent as MicIcon } from "../../../assets/images/icons/icon_mic.svg";
import { ReactComponent as ImportIcon } from "../../../assets/images/icons/icon_import.svg";
import { ReactComponent as AudioIcon } from "../../../assets/images/icons/icon_audio.svg";
import { Link } from "react-router-dom";
import { ReactComponent as TextIcon } from "../../../assets/images/icons/icon_transcription.svg";

const HomePage = () => {
  const onArchiveClick = () => {
    console.log("Hello");
  };

  const CardFirstRow = [
    {
      id: 1,
      title: "Agenda",
      content:
        "Adding agenda before the map generation helps CommPass AI to create more accurate meeting minutes.",
      iconPosition: "left",
      icon: <AgendaIcon />,
    },
    {
      id: 2,
      title: "Real-Time",
      content: "Real-time map generation. Just click and start the meeting.",
      iconPosition: "right",
      icon: <MicIcon />,
    },
  ];
  const MultiCardData = [
    {
      id: 1,
      title: "Transcription",
      content: "Import transcription   file in TXT file format.",
      iconPosition: "right",
      icon: <TextIcon />,
    },
    {
      id: 2,
      title: "Audio",
      content: "Import audio file in MP3 file format.",
      iconPosition: "right",
      icon: <AudioIcon />,
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Button variant="outlined" size="medium">
          <Link to="/archive" className={styles.customLink}>
            Archive
          </Link>
        </Button>
        <div className={styles.content}>
          <div className={styles.content_head}>
            <div className={styles.content_icon}>
              <TitleIcon />
            </div>
            <div className={styles.content_title}>COMMPASS</div>
          </div>
          <div className={styles.content_operation}>
            <div className={styles.content_firstrow}>
              {CardFirstRow.map((item) => {
                return (
                  <Card
                    key={item.id}
                    title={item.title}
                    content={item.content}
                    iconPosition={item.iconPosition}
                    icon={item.icon}
                  />
                );
              })}
            </div>
            <div className={styles.content_secondrow}>
              <Card
                key={crypto.randomUUID()}
                title={"Import"}
                className={styles.content_import}
                content={
                  "By importing previous meeting files, whether the transcript or audio recordings, map generation is possible."
                }
                iconPosition={"top"}
                icon={<ImportIcon />}
              />
              <div className={styles.content_multiblock}>
                {MultiCardData?.map((item) => {
                  return (
                    <Card
                      key={item.id}
                      className={styles.content_multiblockitem}
                      title={item.title}
                      content={item.content}
                      iconPosition={item.iconPosition}
                      icon={item.icon}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
