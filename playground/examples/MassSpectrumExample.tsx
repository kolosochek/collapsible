import ExamplePage from "./shared/ExamplePage";
import ConfigCard from "./shared/ConfigCard";
import styles from "./shared/styles.module.css";

const MASS_VALUES = [0.5, 1, 2, 5];

const MassSpectrumExample = () => (
  <ExamplePage
    title="2. Mass spectrum"
    description="Increasing mass at fixed tension (180) and friction (18). Higher mass feels heavier and slower to start; lower mass feels light and snappy."
  >
    <div className={`${styles.grid} ${styles.grid_4}`}>
      {MASS_VALUES.map((mass) => (
        <ConfigCard
          key={mass}
          label={`mass: ${mass}`}
          config={{ mass, tension: 180, friction: 18 }}
        />
      ))}
    </div>
  </ExamplePage>
);

export default MassSpectrumExample;
