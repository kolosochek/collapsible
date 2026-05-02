import { TAnimationPreset, PRESETS } from "../../src";
import { TSandboxConfig } from "./types";
import Slider from "./controls/Slider";
import Toggle from "./controls/Toggle";
import Select from "./controls/Select";
import styles from "./styles.module.css";

type Props = {
  value: TSandboxConfig;
  onChange: (next: TSandboxConfig) => void;
};

const PRESET_OPTIONS: Array<{ value: TAnimationPreset; label: string }> = [
  { value: "gentle", label: "gentle" },
  { value: "wobbly", label: "wobbly" },
  { value: "stiff", label: "stiff" },
];

const ControlsPanel = ({ value, onChange }: Props) => {
  const setHeight = (key: "mass" | "tension" | "friction", n: number) =>
    onChange({
      ...value,
      heightConfig: { ...value.heightConfig, [key]: n },
    });

  const setPreset = (preset: TAnimationPreset) =>
    onChange({
      ...value,
      preset,
      heightConfig: { ...PRESETS[preset] },
    });

  return (
    <section className={styles.panel}>
      <h2 className={styles.panel_title}>Controls</h2>

      <Select
        label="preset"
        value={value.preset}
        options={PRESET_OPTIONS}
        onChange={setPreset}
      />

      <Slider
        label="mass"
        min={0.1}
        max={5}
        step={0.1}
        value={value.heightConfig.mass}
        onChange={(n) => setHeight("mass", n)}
        format={(n) => n.toFixed(1)}
      />
      <Slider
        label="tension"
        min={1}
        max={500}
        step={1}
        value={value.heightConfig.tension}
        onChange={(n) => setHeight("tension", n)}
      />
      <Slider
        label="friction"
        min={1}
        max={100}
        step={1}
        value={value.heightConfig.friction}
        onChange={(n) => setHeight("friction", n)}
      />
      <Slider
        label="opacity (ms)"
        min={0}
        max={2000}
        step={50}
        value={value.opacityDuration}
        onChange={(n) => onChange({ ...value, opacityDuration: n })}
      />
      <Slider
        label="minHeight"
        min={0}
        max={200}
        step={5}
        value={value.minHeight}
        onChange={(n) => onChange({ ...value, minHeight: n })}
      />

      <div style={{ marginTop: 12 }}>
        <Toggle
          label="isAnimateOpacity"
          checked={value.isAnimateOpacity}
          onChange={(b) => onChange({ ...value, isAnimateOpacity: b })}
        />
        <Toggle
          label="isAnimateHeight"
          checked={value.isAnimateHeight}
          onChange={(b) => onChange({ ...value, isAnimateHeight: b })}
        />
        <Toggle
          label="isOverflowHidden"
          checked={value.isOverflowHidden}
          onChange={(b) => onChange({ ...value, isOverflowHidden: b })}
        />
        <Toggle
          label="isContentSelectable"
          checked={value.isContentSelectable}
          onChange={(b) => onChange({ ...value, isContentSelectable: b })}
        />
      </div>
    </section>
  );
};

export default ControlsPanel;
