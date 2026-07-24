import "dotenv/config";
import express from "express";
import cors from "cors";
import liquidityRoutes from "./routes/liquidity.js";
import m2Routes from "./routes/m2.js";
import dxyRoutes from "./routes/dxy.js";
import stocksRoutes from "./routes/stocks.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, fredConfigured: Boolean(process.env.FRED_API_KEY) });
});

app.use("/api", liquidityRoutes);
app.use("/api", m2Routes);
app.use("/api", dxyRoutes);
app.use("/api", stocksRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

app.listen(PORT, () => {
  console.log(`Liquidity dashboard API listening on http://localhost:${PORT}`);
});
