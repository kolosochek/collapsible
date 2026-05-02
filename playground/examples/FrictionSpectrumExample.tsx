import ExamplePage from "./shared/ExamplePage";
import ConfigCard from "./shared/ConfigCard";
import styles from "./shared/styles.module.css";

const FRICTION_VALUES = [8, 16, 26, 60];

const FrictionSpectrumExample = () => (
  <ExamplePage
    title="4. Friction spectrum"
    description="Increasing friction at fixed mass (1) and tension (180). Lower friction lets the spring overshoot and bounce; higher friction critically damps it."
  >
    <div className={`${styles.grid} ${styles.grid_4}`}>
      {FRICTION_VALUES.map((friction) => (
        <ConfigCard
          key={friction}
          label={`friction: ${friction}`}
          config={{ mass: 1, tension: 180, friction }}
        />
      ))}
    </div>
  </ExamplePage>
);

export default FrictionSpectrumExample;
