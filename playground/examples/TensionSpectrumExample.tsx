import ExamplePage from "./shared/ExamplePage";
import ConfigCard from "./shared/ConfigCard";
import styles from "./shared/styles.module.css";

const TENSION_VALUES = [80, 150, 220, 400];

const TensionSpectrumExample = () => (
  <ExamplePage
    title="3. Tension spectrum"
    description="Increasing tension at fixed mass (1) and friction (18). Higher tension means a stiffer spring — faster acceleration, sharper finish."
  >
    <div className={`${styles.grid} ${styles.grid_4}`}>
      {TENSION_VALUES.map((tension) => (
        <ConfigCard
          key={tension}
          label={`tension: ${tension}`}
          config={{ mass: 1, tension, friction: 18 }}
        />
      ))}
    </div>
  </ExamplePage>
);

export default TensionSpectrumExample;
