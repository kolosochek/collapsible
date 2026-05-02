import { useRef, useState } from "react";
import { TAnimationPreset } from "../../src";
import ExamplePage from "./shared/ExamplePage";
import ConfigCard, { TSyncCommand } from "./shared/ConfigCard";
import styles from "./shared/styles.module.css";

const PRESETS_LIST: TAnimationPreset[] = ["gentle", "wobbly", "stiff"];

const PresetsExample = () => {
  const tickRef = useRef(0);
  const [syncCommand, setSyncCommand] = useState<TSyncCommand | undefined>(undefined);

  const fire = (isOpen: boolean) => {
    tickRef.current += 1;
    setSyncCommand({ isOpen, key: tickRef.current });
  };

  return (
    <ExamplePage
      title="1. Presets — gentle / wobbly / stiff"
      description="Three named presets. Click each card individually, or use Open all / Close all to fire them simultaneously and compare the easing characters side by side."
    >
      <div className={styles.toolbar}>
        <button type="button" onClick={() => fire(true)}>
          Open all
        </button>
        <button type="button" onClick={() => fire(false)}>
          Close all
        </button>
      </div>
      <div className={`${styles.grid} ${styles.grid_3}`}>
        {PRESETS_LIST.map((preset) => (
          <ConfigCard
            key={preset}
            label={`animationPreset="${preset}"`}
            preset={preset}
            syncCommand={syncCommand}
          />
        ))}
      </div>
    </ExamplePage>
  );
};

export default PresetsExample;
