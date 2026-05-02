import styles from "../styles.module.css";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

const Select = <T extends string,>({ label, value, options, onChange }: Props<T>) => (
  <div className={styles.select_row}>
    <label>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export default Select;
