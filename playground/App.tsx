import { useState } from "react";
import Sidebar, { TView } from "./nav/Sidebar";
import { REGISTRY } from "./examples/registry";

const App = () => {
  const [view, setView] = useState<TView>("presets");

  if (view === "sandbox") {
    return (
      <div className="app__layout">
        <Sidebar active={view} onChange={setView} />
        <main className="app__main">
          <h1>Sandbox</h1>
          <p>Sandbox arrives in Tasks 8–12.</p>
        </main>
      </div>
    );
  }

  const ActiveView = REGISTRY[view];

  return (
    <div className="app__layout">
      <Sidebar active={view} onChange={setView} />
      <main className="app__main">
        <ActiveView />
      </main>
    </div>
  );
};

export default App;
