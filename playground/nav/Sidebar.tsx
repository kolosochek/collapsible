import "../styles/global.css";

export type TView =
  | "presets"
  | "mass"
  | "tension"
  | "friction"
  | "accordion"
  | "sandbox";

const NAV_ITEMS: Array<{ id: TView; label: string; group: "examples" | "interactive" }> = [
  { id: "presets", label: "1. Presets", group: "examples" },
  { id: "mass", label: "2. Mass spectrum", group: "examples" },
  { id: "tension", label: "3. Tension spectrum", group: "examples" },
  { id: "friction", label: "4. Friction spectrum", group: "examples" },
  { id: "accordion", label: "5. FAQ accordion", group: "examples" },
  { id: "sandbox", label: "Sandbox", group: "interactive" },
];

type Props = {
  active: TView;
  onChange: (view: TView) => void;
};

const Sidebar = ({ active, onChange }: Props) => {
  const examples = NAV_ITEMS.filter((i) => i.group === "examples");
  const interactive = NAV_ITEMS.filter((i) => i.group === "interactive");

  return (
    <aside className="app__sidebar">
      <h2>Examples</h2>
      <ul className="app__nav-list">
        {examples.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`app__nav-item${
                active === item.id ? " app__nav-item--active" : ""
              }`}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <h2 style={{ marginTop: 24 }}>Interactive</h2>
      <ul className="app__nav-list">
        {interactive.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`app__nav-item${
                active === item.id ? " app__nav-item--active" : ""
              }`}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
