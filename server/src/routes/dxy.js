import { Router } from "express";
import { fetchSeries, latestOf, previousOf } from "../services/fred.js";
import { DXY_SERIES, FX_PAIRS } from "../config/series.js";

const router = Router();

router.get("/dxy-fx", async (req, res) => {
  try {
    const dxySeries = await fetchSeries(DXY_SERIES, { limit: 260 });
    const fxResults = await Promise.all(
      FX_PAIRS.map(async (pair) => {
        const series = await fetchSeries(pair.series, { limit: 30 });
        const latest = latestOf(series);
        const prev = previousOf(series);
        return {
          id: pair.id,
          label: pair.label,
          latest,
          changePct: latest && prev ? ((latest.value - prev.value) / prev.value) * 100 : null,
        };
      })
    );

    res.json({
      dxy: {
        series: dxySeries,
        latest: latestOf(dxySeries),
        previous: previousOf(dxySeries),
      },
      fx: fxResults,
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

export default router;
