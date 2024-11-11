import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import Collapsible from "./components/Collapsible/Collapsible";

const App = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleCollapsibleToggle = () => {
    setIsExpanded((prevState) => !prevState);
  };

  return (
    <>
      <button onClick={handleCollapsibleToggle}>
        {isExpanded ? "Close me" : "Open me"}
      </button>
      <Collapsible
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        content={
          <article>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </article>
        }
      />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
