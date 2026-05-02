import { useState, useEffect } from "react";
import { SpringConfig } from "@react-spring/web";
import { Collapsible, TAnimationPreset } from "../../../src";
import { getContent, TContentLength } from "./content";
import styles from "./styles.module.css";

export type TSyncCommand = { isOpen: boolean; key: number };

type Props = {
  label: string;
  preset?: TAnimationPreset;
  config?: SpringConfig;
  contentLength?: TContentLength;
  syncCommand?: TSyncCommand;
};

const ConfigCard = ({
  label,
  preset,
  config,
  contentLength = "medium",
  syncCommand,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (syncCommand) setIsExpanded(syncCommand.isOpen);
  }, [syncCommand]);

  return (
    <article className={styles.card}>
      <header
        className={styles.card_header}
        onClick={() => setIsExpanded((p) => !p)}
      >
        <span>{label}</span>
        <span>{isExpanded ? "▲" : "▼"}</span>
      </header>
      <Collapsible
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        animationPreset={preset}
        animationHeightConfig={config}
        content={<div className={styles.card_content}>{getContent(contentLength)}</div>}
      />
    </article>
  );
};

export default ConfigCard;
