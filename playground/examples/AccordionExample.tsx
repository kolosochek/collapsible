import { useState } from "react";
import { Collapsible } from "../../src";
import ExamplePage from "./shared/ExamplePage";
import styles from "./shared/styles.module.css";

const FAQ = [
  {
    id: "what",
    question: "What is this library?",
    answer:
      "A small React component for collapse/expand interactions, animated by react-spring. " +
      "It exposes a controlled isExpanded prop and a rich set of animation knobs.",
  },
  {
    id: "physics",
    question: "How does the animation work?",
    answer:
      "The component uses a react-spring useSpring hook to animate height and opacity. " +
      "The height spring config is selected from a preset (gentle, wobbly, stiff) and can be " +
      "overridden per-key via animationHeightConfig.",
  },
  {
    id: "accordion",
    question: "Can I use this as an accordion?",
    answer:
      "Yes — pass isAccordion=true and a shared openedTabId state. When one tab opens, " +
      "the others collapse automatically.",
  },
];

const AccordionExample = () => {
  const [openedTabId, setOpenedTabId] = useState("");
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const setIsExpandedFor = (id: string) => (flag: boolean) => {
    setExpandedMap((prev) => ({ ...prev, [id]: flag }));
  };

  return (
    <ExamplePage
      title="5. FAQ Accordion"
      description="A real-world use of isAccordion=true with the wobbly preset. Opening one tab collapses the others."
    >
      <div className={`${styles.grid} ${styles.grid_1}`}>
        {FAQ.map((item) => (
          <article key={item.id} className={styles.card}>
            <header
              className={styles.card_header}
              onClick={() => setIsExpandedFor(item.id)(!expandedMap[item.id])}
            >
              <span>{item.question}</span>
              <span>{expandedMap[item.id] ? "▲" : "▼"}</span>
            </header>
            <Collapsible
              isExpanded={!!expandedMap[item.id]}
              setIsExpanded={setIsExpandedFor(item.id)}
              isAccordion
              accordionTabId={item.id}
              openedTabId={openedTabId}
              setOpenedTabId={setOpenedTabId}
              animationPreset="wobbly"
              content={<div className={styles.card_content}>{item.answer}</div>}
            />
          </article>
        ))}
      </div>
    </ExamplePage>
  );
};

export default AccordionExample;
