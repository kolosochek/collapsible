import { useState } from "react";
import Sidebar, { TView } from "./nav/Sidebar";
import { REGISTRY } from "./examples/registry";
import Sandbox from "./sandbox/Sandbox";

const App = () => {
  const [view, setView] = useState<TView>("presets");

  const Body = view === "sandbox" ? Sandbox : REGISTRY[view];

  return (
    <div className="app__layout">
      <Sidebar active={view} onChange={setView} />
      <main className="app__main">
        <Body />
      </main>
    </div>
  );
};

export default App;
