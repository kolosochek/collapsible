import { useState } from "react";
import { Collapsible } from "../../src";
import { TSandboxConfig, INITIAL_CONFIG } from "./types";
import { useProfiles } from "./useProfiles";
import ControlsPanel from "./ControlsPanel";
import ProfilesPanel from "./ProfilesPanel";
import { getContent } from "../examples/shared/content";
import styles from "./styles.module.css";

const Sandbox = () => {
  const [config, setConfig] = useState<TSandboxConfig>(INITIAL_CONFIG);
  const [isExpanded, setIsExpanded] = useState(false);
  const profiles = useProfiles();

  return (
    <section>
      <h1>Sandbox</h1>
      <p style={{ margin: "0 0 24px", color: "#4a4a4a", fontSize: "0.95rem" }}>
        Live tweak every Collapsible knob and persist named profiles in localStorage.
      </p>

      <div className={styles.layout}>
        <ControlsPanel value={config} onChange={setConfig} />
        <ProfilesPanel
          profiles={profiles}
          currentConfig={config}
          onLoad={setConfig}
        />
      </div>

      <div className={styles.preview}>
        <button type="button" onClick={() => setIsExpanded((p) => !p)}>
          {isExpanded ? "Close preview" : "Open preview"}
        </button>
        <Collapsible
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          animationPreset={config.preset}
          animationHeightConfig={config.heightConfig}
          animationOpacityConfig={{ duration: config.opacityDuration }}
          isAnimateOpacity={config.isAnimateOpacity}
          isAnimateHeight={config.isAnimateHeight}
          isOverflowHidden={config.isOverflowHidden}
          isContentSelectable={config.isContentSelectable}
          minHeight={config.minHeight}
          content={
            <div style={{ padding: 12, background: "#f7f7f7", borderRadius: 6 }}>
              {getContent("medium")}
            </div>
          }
        />
      </div>

      {!profiles.persistenceOk && (
        <div className={styles.toast}>
          localStorage is unavailable — profiles will not persist across reload.
        </div>
      )}
    </section>
  );
};

export default Sandbox;
