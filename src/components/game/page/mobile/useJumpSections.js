import { useMemo, useRef, useState } from "react";

// Scroll-spy for the mobile game page. Each part of a section registers through
// its ref callback (React 19 runs the returned cleanup on unmount), one shared
// IntersectionObserver watches them all, and `current` is the first part, in
// page order, crossing the band just under the sticky header. No effects.
//
// `jump(id)` scrolls a part to the top; the part's scroll-margin keeps its
// title clear of the app header and the sticky section header.
const BAND = "-140px 0px -55% 0px";

export const useJumpSections = (ids) => {
  const [current, setCurrent] = useState(null);
  const order = useRef(ids);
  order.current = ids;
  const visible = useRef(new Set());
  const nodes = useRef({});
  const observer = useRef(null);

  const getObserver = () => {
    if (!observer.current && typeof IntersectionObserver !== "undefined") {
      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            const id = e.target.dataset.jump;
            if (e.isIntersecting) visible.current.add(id);
            else visible.current.delete(id);
          });
          const first = order.current.find((id) => visible.current.has(id));
          if (first) setCurrent(first);
        },
        { rootMargin: BAND },
      );
    }
    return observer.current;
  };

  const key = ids.join("|");
  const refs = useMemo(
    () =>
      Object.fromEntries(
        key.split("|").filter(Boolean).map((id) => [
          id,
          (el) => {
            if (!el) return undefined;
            nodes.current[id] = el;
            const io = getObserver();
            io?.observe(el);
            return () => {
              io?.unobserve(el);
              visible.current.delete(id);
              delete nodes.current[id];
            };
          },
        ]),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  const jump = (id) => {
    setCurrent(id);
    nodes.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return { current: current && ids.includes(current) ? current : ids[0] ?? null, refs, jump };
};

export default useJumpSections;
