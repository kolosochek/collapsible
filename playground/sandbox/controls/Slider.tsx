import styles from "../styles.module.css";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
};

const Slider = ({ label, value, min, max, step, onChange, format }: Props) => (
  <div className={styles.control_row}>
    <label>{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <span className={styles.value}>{format ? format(value) : value}</span>
  </div>
);

export default Slider;
