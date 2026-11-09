import { useRef, useState } from "react";
import useMountEffect from "./useMountEffect";

// The passport supplies a fixed face count and delay for its mounted lifetime.
export const usePassportRotation = (count, delayMs) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = useRef(0);
  const timer = useRef(null);

  const schedule = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      selected.current = (selected.current + 1) % count;
      setActiveIndex(selected.current);
      schedule();
    }, delayMs);
  };

  useMountEffect(() => {
    schedule();
    return () => clearTimeout(timer.current);
  });

  const select = (index) => {
    if (index === selected.current) return;
    selected.current = index;
    setActiveIndex(index);
    schedule();
  };

  return [activeIndex, select];
};
