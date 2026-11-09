import { act, renderHook } from "@testing-library/react";
import { usePassportRotation } from "./usePassportRotation";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const advance = (ms) => act(() => jest.advanceTimersByTime(ms));

test("automatically advances both faces on successive intervals", () => {
  const { result } = renderHook(() => usePassportRotation(2, 5000));
  expect(result.current[0]).toBe(0);
  advance(5000);
  expect(result.current[0]).toBe(1);
  advance(5000);
  expect(result.current[0]).toBe(0);
});

test("selecting the other face restarts its full dwell interval", () => {
  const { result } = renderHook(() => usePassportRotation(2, 5000));
  advance(2000);
  act(() => result.current[1](1));
  advance(3000);
  expect(result.current[0]).toBe(1);
  advance(2000);
  expect(result.current[0]).toBe(0);
});

test("selecting the active face keeps the existing deadline", () => {
  const { result } = renderHook(() => usePassportRotation(2, 5000));
  advance(2000);
  act(() => result.current[1](0));
  advance(3000);
  expect(result.current[0]).toBe(1);
});

test("clears the pending advance when unmounted", () => {
  const { unmount } = renderHook(() => usePassportRotation(2, 5000));
  expect(jest.getTimerCount()).toBe(1);
  unmount();
  expect(jest.getTimerCount()).toBe(0);
});
