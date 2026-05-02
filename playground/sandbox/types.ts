import { TAnimationPreset } from "../../src";

export type TSandboxConfig = {
  preset: TAnimationPreset;
  heightConfig: { mass: number; tension: number; friction: number };
  opacityDuration: number;
  isAnimateOpacity: boolean;
  isAnimateHeight: boolean;
  isOverflowHidden: boolean;
  isContentSelectable: boolean;
  minHeight: number;
};

export type TProfilesStore = {
  schemaVersion: 1;
  profiles: Record<string, TSandboxConfig>;
};

export const INITIAL_CONFIG: TSandboxConfig = {
  preset: "gentle",
  heightConfig: { mass: 1, tension: 180, friction: 18 },
  opacityDuration: 250,
  isAnimateOpacity: true,
  isAnimateHeight: true,
  isOverflowHidden: true,
  isContentSelectable: true,
  minHeight: 0,
};
