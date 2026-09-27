import { useRef } from "react";

const MAX_TILT_DEGREES = 2;

export function useTactileTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const pressed = useRef(false);

  const update = (clientX: number, clientY: number) => {
    const node = ref.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width, clientX - bounds.left));
    const y = Math.max(0, Math.min(bounds.height, clientY - bounds.top));
    const nx = bounds.width ? x / bounds.width - 0.5 : 0;
    const ny = bounds.height ? y / bounds.height - 0.5 : 0;
    node.style.setProperty("--tilt-x", `${(-ny * MAX_TILT_DEGREES * 2).toFixed(2)}deg`);
    node.style.setProperty("--tilt-y", `${(nx * MAX_TILT_DEGREES * 2).toFixed(2)}deg`);
    node.style.setProperty("--touch-x", `${x.toFixed(0)}px`);
    node.style.setProperty("--touch-y", `${y.toFixed(0)}px`);
  };

  const reset = () => {
    const node = ref.current;
    if (!node) return;
    pressed.current = false;
    node.dataset["tactileActive"] = "false";
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
  };

  return {
    ref,
    onPointerDown: (event: React.PointerEvent<T>) => {
      pressed.current = true;
      event.currentTarget.dataset["tactileActive"] = "true";
      event.currentTarget.setPointerCapture(event.pointerId);
      update(event.clientX, event.clientY);
    },
    onPointerMove: (event: React.PointerEvent<T>) => {
      if (event.pointerType !== "mouse" && !pressed.current) return;
      update(event.clientX, event.clientY);
    },
    onPointerUp: reset,
    onPointerCancel: reset,
    onPointerLeave: (event: React.PointerEvent<T>) => {
      if (event.pointerType === "mouse" && !pressed.current) reset();
    },
  };
}