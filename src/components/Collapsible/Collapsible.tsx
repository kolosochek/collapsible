import React from "react";
import { useEffect, useRef } from "react";
import { animated, useSpring, SpringConfig } from "@react-spring/web";
import styles from "./styles.module.css";
import { PRESETS } from "./presets";
import { TCollapsibleProps, TContainerHeight } from "../../types/collapsible";
import { isFunction, isUndefined } from "../../types/typeguards";

const Collapsible = ({
  content,
  isExpanded,
  setIsExpanded,
  isOverflowHidden = true,
  isAnimateOpacity = true,
  isAnimateHeight = true,
  isSetHeightAuto = true,
  isAccordion = false,
  isContentSelectable = true,
  minHeight,
  animationPreset = "gentle",
  animationHeightConfig,
  animationOpacityConfig = {
    duration: 250,
  },
  wrapperClassName = "",
  customStyles,
  accordionTabId,
  openedTabId,
  setOpenedTabId,
  finalHeight = "auto",
  onAnimationFinished,
}: TCollapsibleProps) => {
  const isExpandedRef = useRef<boolean>(isExpanded);
  const isMountedRef = useRef<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerContentRef = useRef<HTMLDivElement | null>(null);

  const resolvedHeightConfig: SpringConfig = {
    ...PRESETS[animationPreset],
    ...animationHeightConfig,
  };

  const handleAnimationStart = () => {
    wrapperRef.current?.classList.add(styles.state__animate);
  };

  const animationRestRef = useRef<() => void>(() => {});
  animationRestRef.current = () => {
    if (isExpandedRef.current && isSetHeightAuto) {
      api.start({
        height: finalHeight,
        immediate: true,
      });
    }
    wrapperRef.current?.classList.remove(styles.state__animate);
    if (isFunction(onAnimationFinished)) {
      onAnimationFinished();
    }
  };

  const handleAnimationRest = () => animationRestRef.current();

  const [{ height, opacity }, api] = useSpring<TContainerHeight>(() => {
    const resultContainerHeight = containerRef.current
      ? containerRef.current?.offsetHeight
      : 0;

    return {
      from: {
        height: isExpandedRef.current
          ? finalHeight
          : isAnimateHeight
          ? minHeight ?? 0
          : finalHeight,
        opacity: isUndefined(minHeight) && isAnimateOpacity ? 0 : 1,
      },
      to: {
        height: isExpandedRef.current ? finalHeight : resultContainerHeight,
        opacity: 1,
      },
      immediate: !isAnimateHeight,
      onStart: handleAnimationStart,
      onRest: handleAnimationRest,
      config: (key: string) => {
        if (key === "height") {
          return resolvedHeightConfig;
        } else if (key === "opacity" && isAnimateOpacity) {
          return animationOpacityConfig;
        }
      },
    };
  });

  const collapseContainer = (isClearAccordionTab: boolean = true) => {
    const resultContainerHeight = containerRef.current
      ? containerRef.current?.offsetHeight
      : 0;

    isExpandedRef.current = false;
    setIsExpanded(false);
    if (isFunction(setOpenedTabId) && isClearAccordionTab) {
      setOpenedTabId("");
    }
    api.start({
      from: {
        height: resultContainerHeight,
        opacity: 1,
      },
      to: {
        height: minHeight ?? 0,
        opacity: isUndefined(minHeight) && isAnimateOpacity ? 0 : 1,
      },
      immediate: !isAnimateHeight,
      onStart: handleAnimationStart,
      onRest: handleAnimationRest,
    });
  };

  const expandContainer = () => {
    if (!containerContentRef.current) return;

    isExpandedRef.current = true;
    setIsExpanded(true);
    if (isFunction(setOpenedTabId) && accordionTabId) {
      setOpenedTabId(accordionTabId);
    }
    api.start({
      height: containerContentRef.current.offsetHeight,
      opacity: 1,
      onStart: handleAnimationStart,
      onRest: handleAnimationRest,
    });
  };

  const handleStopPropagation = (
    ev: MouseEvent | React.MouseEvent | React.TouchEvent
  ) => {
    ev.stopPropagation();
  };

  const containerStyle = {
    opacity: isAnimateOpacity ? opacity : 1,
    height: height,
  };

  useEffect(() => {
    if (isAccordion && openedTabId !== accordionTabId) {
      collapseContainer(false);
    }
  }, [openedTabId]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      isExpandedRef.current = isExpanded;
      return;
    }

    if (!isExpanded && isExpandedRef.current) {
      collapseContainer(!isAccordion);
    } else if (isExpanded && !isExpandedRef.current) {
      expandContainer();
    }
  }, [isExpanded]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper}${
        wrapperClassName ? ` ${wrapperClassName}` : ""
      }${!isContentSelectable ? ` ${styles.state__unselectable}` : ""}${
        isOverflowHidden ? ` ${styles.state__overflow_hidden}` : ""
      }`}
      style={customStyles?.wrapper}
    >
      <animated.div
        ref={containerRef}
        style={containerStyle}
        onClick={handleStopPropagation}
        className={styles.content_wrapper}
      >
        <div ref={containerContentRef} style={customStyles?.content}>
          {content}
        </div>
      </animated.div>
    </div>
  );
};

export default Collapsible;
