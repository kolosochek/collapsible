import { SpringConfig } from "@react-spring/web";

export const PRESETS = {
  gentle: { mass: 1, tension: 120, friction: 14 },
  wobbly: { mass: 1, tension: 180, friction: 12 },
  stiff: { mass: 1, tension: 210, friction: 20 },
} as const satisfies Record<string, SpringConfig>;

export type TAnimationPreset = keyof typeof PRESETS;
