import { Router } from "express";
import { fetchSeries } from "../services/fred.js";
import { alignToBase, convertUnit, toUsdMillions } from "../services/align.js";
import { GLOBAL_M2 } from "../config/series.js";

const router = Router();

router.get("/global-m2", async (req, res) => {
  try {
    const results = await Promise.all(
      GLOBAL_M2.map(async (country) => {
        const raw = await fetchSeries(country.series, { limit: 120 });
        let fx = null;
        if (country.fxSeries) {
          fx = await fetchSeries(country.fxSeries, { limit: 1800 });
        }
        const fxAligned = fx ? alignToBase(raw, fx) : null;

        const series = raw.map((obs, i) => {
          const localMM = convertUnit(obs.value, country.unit);
          const fxValue = fxAligned ? fxAligned[i]?.value : null;
          const usdMM = country.fxSeries ? toUsdMillions(localMM, fxValue, country.fxDirection) : localMM;
          return { date: obs.date, usdMillions: usdMM };
        });

        return { id: country.id, label: country.label, series };
      })
    );

    const latestTotal = results.reduce((sum, c) => {
      const last = c.series[c.series.length - 1];
      return sum + (last?.usdMillions ?? 0);
    }, 0);

    res.json({ unit: "USD_MM", countries: results, latestTotalUsdMillions: latestTotal });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

export default router;
