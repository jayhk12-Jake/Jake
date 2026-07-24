import { Router } from "express";
import { fetchDomesticTopVolume } from "../services/naver.js";
import { fetchGlobalTopVolume } from "../services/yahoo.js";

const router = Router();

router.get("/stocks/top-volume", async (req, res) => {
  const [domestic, global] = await Promise.allSettled([
    fetchDomesticTopVolume(10),
    fetchGlobalTopVolume(10),
  ]);

  res.json({
    domestic:
      domestic.status === "fulfilled"
        ? { ok: true, rows: domestic.value }
        : { ok: false, error: domestic.reason?.message },
    global:
      global.status === "fulfilled"
        ? { ok: true, rows: global.value }
        : { ok: false, error: global.reason?.message },
  });
});

export default router;
