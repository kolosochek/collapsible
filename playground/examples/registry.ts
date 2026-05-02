import { ComponentType } from "react";
import { TView } from "../nav/Sidebar";
import PresetsExample from "./PresetsExample";
import MassSpectrumExample from "./MassSpectrumExample";
import TensionSpectrumExample from "./TensionSpectrumExample";
import FrictionSpectrumExample from "./FrictionSpectrumExample";
import AccordionExample from "./AccordionExample";

export const REGISTRY: Record<Exclude<TView, "sandbox">, ComponentType> = {
  presets: PresetsExample,
  mass: MassSpectrumExample,
  tension: TensionSpectrumExample,
  friction: FrictionSpectrumExample,
  accordion: AccordionExample,
};
