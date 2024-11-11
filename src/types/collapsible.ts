import React, { Dispatch, SetStateAction } from "react";
import {SpringConfig, SpringValues} from "@react-spring/web";

export type TContainerHeight = SpringValues<{
  height: number | string;
  maxWidth: number | string;
  opacity: number;
}>;

const collapsibleModesArr = ["vertical", "horizontal"] as const;
type TCollapsibleMode = (typeof collapsibleModesArr)[number];

const collapsibleStylesArr = ["wrapper", "content"] as const;
type TCollapsibleStylesSection = (typeof collapsibleStylesArr)[number];

type TCollapsibleStyles = Partial<{
  [key in TCollapsibleStylesSection]: React.CSSProperties;
}>;

interface ICollapsibleBaseProps {
  content: React.ReactNode;
  isExpanded: boolean;
  mode?: TCollapsibleMode;
  isInitiallyExpanded?: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>> | ((flag: boolean) => void);
  isOverflowHidden?: boolean;
  isAnimateOpacity?: boolean;
  isAnimateHeight?: boolean;
  isSetHeightAuto?: boolean;
  isContentSelectable?: boolean;
  animationHeightConfig?: SpringConfig;
  animationOpacityConfig?: SpringConfig;
  customStyles?: TCollapsibleStyles;
  minHeight?: number | string;
  onAnimationFinished?: () => void;
  wrapperClassName?: string;
  finalHeight?: string;
}

interface ICollapsibleAccordionNeverProps {
  isAccordion?: never;
  accordionTabId?: never;
  openedTabId?: never;
  setOpenedTabId?: never;
}

interface ICollapsibleAccordionProps {
  isAccordion: boolean;
  accordionTabId: string;
  openedTabId: string;
  setOpenedTabId: Dispatch<SetStateAction<string>>;
}

export type TCollapsibleProps = ICollapsibleBaseProps &
  (ICollapsibleAccordionProps | ICollapsibleAccordionNeverProps);
