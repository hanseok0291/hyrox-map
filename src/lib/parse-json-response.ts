/** fetch 후 빈 본문·HTML 에러 페이지에서 res.json() 예외 방지 */
export async function parseJsonResponse<T = Record<string, unknown>>(
  res: Response
): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(
      res.ok
        ? "서버 응답이 비어 있습니다."
        : `서버 오류 (${res.status}). 개발 서버를 재시작해 보세요.`
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `서버 응답을 읽을 수 없습니다 (${res.status}). 개발 서버를 재시작해 보세요.`
    );
  }
}
