import StatTile from "./StatTile.jsx";
import { formatIndex } from "../format.js";

export default function DxyFxPanel({ dxy, fx }) {
  const dxyChangePct =
    dxy.latest && dxy.previous
      ? ((dxy.latest.value - dxy.previous.value) / dxy.previous.value) * 100
      : null;

  return (
    <div className="grid tiles-grid">
      <StatTile
        label="달러 인덱스 (무역가중, Broad)"
        value={formatIndex(dxy.latest?.value)}
        deltaPct={dxyChangePct}
        asOf={dxy.latest?.date}
      />
      {fx.map((pair) => (
        <StatTile
          key={pair.id}
          label={pair.label}
          value={formatIndex(pair.latest?.value, 2)}
          deltaPct={pair.changePct}
          asOf={pair.latest?.date}
        />
      ))}
    </div>
  );
}
