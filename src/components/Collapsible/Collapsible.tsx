import React from "react";
import { useEffect, useRef } from "react";
import { animated, useSpring } from "@react-spring/web";
import styles from "./styles.module.css";
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
  animationHeightConfig = {
    mass: 1,
    tension: 176,
    friction: 26,
  },
  animationOpacityConfig = {
    duration: 250,
  },
  wrapperClassName = "",
  customStyles,
  accordionTabId,
  openedTabId,
  setOpenedTabId,
  finalHeight = "auto",
  // callbacks
  onAnimationFinished,
}: TCollapsibleProps) => {
  const isExpandedRef = useRef<boolean>(isExpanded);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerContentRef = useRef<HTMLDivElement | null>(null);

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
      onStart: () => {
        // append animate class
        wrapperRef.current?.classList.add(styles.state__animate);
      },
      onRest: () => {
        if (isExpandedRef.current && isSetHeightAuto) {
          api.start({
            height: finalHeight,
            immediate: true,
          });
        }
        // remove animate class
        wrapperRef.current?.classList.remove(styles.state__animate);
      },
      config: (key: string) => {
        if (key === "height") {
          return animationHeightConfig;
        } else if (key === "opacity" && isAnimateOpacity) {
          return animationOpacityConfig;
        }
      },
    };
  }, [containerRef.current]);

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
      onRest: () => {
        if (isFunction(onAnimationFinished)) {
          onAnimationFinished();
        }
      },
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
      onRest: () => {
        if (isFunction(onAnimationFinished)) {
          onAnimationFinished();
        }
      },
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

  // collapse other tabs if is any another tab is expanded
  useEffect(() => {
    if (isAccordion && openedTabId !== accordionTabId) {
      collapseContainer(false);
    }
  }, [openedTabId]);

  // collapse tabs by external state change
  useEffect(() => {
    if (isUndefined(isExpandedRef.current)) {
      isExpandedRef.current = isExpanded;
    }

    if (!isExpanded) {
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
