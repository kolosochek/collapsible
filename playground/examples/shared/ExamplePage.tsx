import { ReactNode } from "react";
import styles from "./styles.module.css";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

const ExamplePage = ({ title, description, children }: Props) => (
  <section>
    <h1>{title}</h1>
    <p className={styles.lead}>{description}</p>
    {children}
  </section>
);

export default ExamplePage;
