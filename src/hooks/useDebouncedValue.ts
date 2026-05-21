"use client";

import { useEffect, useState } from "react";

/** Dev에서 검색·필터마다 API/지도 갱신이 연속 실행되는 것을 막습니다. */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

/** 객체 필터는 참조가 매번 바뀌므로 직렬화 키로 디바운스합니다. */
export function useDebouncedFilterKey(
  key: string,
  delayMs = 400
): string {
  return useDebouncedValue(key, delayMs);
}
