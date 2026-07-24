import { formatNumber } from "../format.js";

export default function TopVolumeTable({ title, rows, nameKey = "name" }) {
  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 8 }}>
        {title}
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>종목</th>
            <th className="num-right">현재가</th>
            <th className="num-right">등락률</th>
            <th className="num-right">거래량</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const changePct = row.changePct;
            const deltaClass =
              changePct > 0 ? "good" : changePct < 0 ? "bad" : "neutral";
            const icon = changePct > 0 ? "▲" : changePct < 0 ? "▼" : "→";
            return (
              <tr key={row.rank}>
                <td>{row.rank}</td>
                <td>{row[nameKey]}</td>
                <td className="num-right">{formatNumber(row.price)}</td>
                <td className={`num-right delta ${deltaClass}`}>
                  <span aria-hidden="true">{icon}</span> {Math.abs(changePct ?? 0).toFixed(2)}%
                </td>
                <td className="num-right">{formatNumber(row.volume)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
