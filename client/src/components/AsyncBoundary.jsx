export default function AsyncBoundary({ state, children }) {
  if (state.status === "loading") {
    return <div className="card loading-box">불러오는 중…</div>;
  }
  if (state.status === "error") {
    return (
      <div className="card error-box">
        데이터를 불러오지 못했습니다: {state.error?.message || "알 수 없는 오류"}
      </div>
    );
  }
  return children(state.data);
}
