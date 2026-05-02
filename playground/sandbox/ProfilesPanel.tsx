import { useState } from "react";
import { TSandboxConfig, INITIAL_CONFIG } from "./types";
import { TUseProfiles } from "./useProfiles";
import styles from "./styles.module.css";

type Props = {
  profiles: TUseProfiles;
  currentConfig: TSandboxConfig;
  onLoad: (config: TSandboxConfig) => void;
};

const ProfilesPanel = ({ profiles, currentConfig, onLoad }: Props) => {
  const [draftName, setDraftName] = useState("");

  const handleSave = () => {
    const name = draftName.trim();
    if (!name) return;
    if (profiles.exists(name)) {
      const ok = window.confirm(`Profile "${name}" already exists. Overwrite?`);
      if (!ok) return;
    }
    profiles.save(name, currentConfig);
    setDraftName("");
  };

  const handleDelete = (name: string) => {
    const ok = window.confirm(`Delete profile "${name}"?`);
    if (ok) profiles.remove(name);
  };

  const items = profiles.list();

  return (
    <section className={styles.panel}>
      <h2 className={styles.panel_title}>Profiles</h2>

      {items.length === 0 ? (
        <p style={{ margin: "0 0 12px", color: "#6b6b6b", fontSize: "0.85rem" }}>
          No saved profiles yet. Tweak the controls and save them with a name.
        </p>
      ) : (
        <ul className={styles.profiles_list}>
          {items.map((name) => (
            <li key={name} className={styles.profile_item}>
              <span>{name}</span>
              <button
                type="button"
                onClick={() => {
                  const cfg = profiles.load(name);
                  if (cfg) onLoad(cfg);
                }}
              >
                Load
              </button>
              <button type="button" onClick={() => handleDelete(name)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.profile_actions}>
        <input
          type="text"
          placeholder="Profile name"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          style={{ flex: 1, padding: "6px 8px", border: "1px solid #d4d4d4", borderRadius: 4 }}
        />
        <button type="button" onClick={handleSave}>
          Save as…
        </button>
        <button type="button" onClick={() => onLoad(INITIAL_CONFIG)}>
          Reset
        </button>
      </div>
    </section>
  );
};

export default ProfilesPanel;
