import { Router } from "express";
import { fetchSeries, latestOf, previousOf } from "../services/fred.js";
import { alignToBase, convertUnit, toUsdMillions } from "../services/align.js";
import { FED_NET_LIQUIDITY, CENTRAL_BANKS } from "../config/series.js";

const router = Router();

// Fed 순유동성 = Fed 총자산 - TGA(재무부 일반계정) - ON RRP(익일 역레포)
router.get("/net-liquidity", async (req, res) => {
  try {
    const [assets, tga, rrp] = await Promise.all([
      fetchSeries(FED_NET_LIQUIDITY.fedAssets, { limit: 260 }),
      fetchSeries(FED_NET_LIQUIDITY.tga, { limit: 520 }),
      fetchSeries(FED_NET_LIQUIDITY.rrp, { limit: 1800 }),
    ]);

    const tgaAligned = alignToBase(assets, tga);
    const rrpBillionsToMillions = rrp.map((o) => ({ date: o.date, value: o.value * 1000 }));
    const rrpAligned = alignToBase(assets, rrpBillionsToMillions);

    const series = assets.map((a, i) => {
      const t = tgaAligned[i]?.value ?? null;
      const r = rrpAligned[i]?.value ?? null;
      const netLiquidityMM = t != null && r != null ? a.value - t - r : null;
      return { date: a.date, fedAssets: a.value, tga: t, rrp: r, netLiquidity: netLiquidityMM };
    });

    res.json({
      unit: "USD_MM",
      series,
      latest: series[series.length - 1] ?? null,
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// 주요국 중앙은행 대차대조표 (USD 환산)
router.get("/central-banks", async (req, res) => {
  try {
    const results = await Promise.all(
      CENTRAL_BANKS.map(async (bank) => {
        const raw = await fetchSeries(bank.series, { limit: 260 });
        let fx = null;
        if (bank.fxSeries) {
          fx = await fetchSeries(bank.fxSeries, { limit: 1800 });
        }
        const fxAligned = fx ? alignToBase(raw, fx) : null;

        const series = raw.map((obs, i) => {
          const localMM = convertUnit(obs.value, bank.unit);
          const fxValue = fxAligned ? fxAligned[i]?.value : null;
          const usdMM = bank.fxSeries ? toUsdMillions(localMM, fxValue, bank.fxDirection) : localMM;
          return { date: obs.date, usdMillions: usdMM };
        });

        return { id: bank.id, label: bank.label, series };
      })
    );

    // 공통 날짜 기준(가장 최근 시리즈의 날짜)으로 최신 합계 계산
    const latestTotal = results.reduce((sum, bank) => {
      const last = bank.series[bank.series.length - 1];
      return sum + (last?.usdMillions ?? 0);
    }, 0);

    res.json({ unit: "USD_MM", banks: results, latestTotalUsdMillions: latestTotal });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

export default router;
