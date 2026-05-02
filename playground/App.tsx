import { useState } from "react";
import Sidebar, { TView } from "./nav/Sidebar";

const App = () => {
  const [view, setView] = useState<TView>("presets");

  return (
    <div className="app__layout">
      <Sidebar active={view} onChange={setView} />
      <main className="app__main">
        <h1>{view}</h1>
        <p>View "{view}" — content arrives in later tasks.</p>
      </main>
    </div>
  );
};

export default App;
