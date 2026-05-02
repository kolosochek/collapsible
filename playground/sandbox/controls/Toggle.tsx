import styles from "../styles.module.css";

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Toggle = ({ label, checked, onChange }: Props) => (
  <label className={styles.toggle_row}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span>{label}</span>
  </label>
);

export default Toggle;
