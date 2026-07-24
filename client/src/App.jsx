import { useApiData } from "./useApiData.js";
import { api } from "./api.js";
import Section from "./components/Section.jsx";
import AsyncBoundary from "./components/AsyncBoundary.jsx";
import StatTile from "./components/StatTile.jsx";
import NetLiquidityChart from "./components/NetLiquidityChart.jsx";
import StackedAreaChart from "./components/StackedAreaChart.jsx";
import DxyFxPanel from "./components/DxyFxPanel.jsx";
import TopVolumeTable from "./components/TopVolumeTable.jsx";
import { mergeByDate } from "./mergeSeries.js";
import { formatUsdFromMillions } from "./format.js";

function computeDeltaPct(series, key) {
  const clean = series.filter((d) => d[key] != null);
  if (clean.length < 2) return null;
  const last = clean[clean.length - 1][key];
  const prev = clean[clean.length - 2][key];
  return ((last - prev) / prev) * 100;
}

export default function App() {
  const netLiquidity = useApiData(api.netLiquidity, []);
  const centralBanks = useApiData(api.centralBanks, []);
  const globalM2 = useApiData(api.globalM2, []);
  const dxyFx = useApiData(api.dxyFx, []);
  const topVolume = useApiData(api.topVolume, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>글로벌 유동성 모니터링 대시보드</h1>
        <span className="subtitle">
          Fed 순유동성 · 주요국 중앙은행 대차대조표 · 글로벌 M2 · 달러 인덱스/환율 · 거래량 Top 10
        </span>
      </header>

      <Section
        title="Fed 순유동성 (Net Liquidity)"
        desc="Fed 총자산 − 재무부 일반계정(TGA) − 익일 역레포(ON RRP). 위험자산 유동성 환경의 대표 지표입니다."
      >
        <AsyncBoundary state={netLiquidity}>
          {(data) => (
            <>
              <div className="grid tiles-grid" style={{ marginBottom: 16 }}>
                <StatTile
                  label="Fed 순유동성"
                  value={formatUsdFromMillions(data.latest?.netLiquidity)}
                  deltaPct={computeDeltaPct(data.series, "netLiquidity")}
                  asOf={data.latest?.date}
                />
                <StatTile
                  label="Fed 총자산 (WALCL)"
                  value={formatUsdFromMillions(data.latest?.fedAssets)}
                  asOf={data.latest?.date}
                />
                <StatTile
                  label="재무부 일반계정 (TGA)"
                  value={formatUsdFromMillions(data.latest?.tga)}
                  asOf={data.latest?.date}
                />
                <StatTile
                  label="익일 역레포 (ON RRP)"
                  value={formatUsdFromMillions(data.latest?.rrp)}
                  asOf={data.latest?.date}
                />
              </div>
              <NetLiquidityChart series={data.series} />
            </>
          )}
        </AsyncBoundary>
      </Section>

      <Section
        title="주요국 중앙은행 대차대조표"
        desc="Fed / ECB / BOJ / PBOC 총자산을 USD로 환산해 합산했습니다."
      >
        <AsyncBoundary state={centralBanks}>
          {(data) => (
            <>
              <div className="grid tiles-grid" style={{ marginBottom: 16 }}>
                <StatTile
                  label="4대 중앙은행 합계"
                  value={formatUsdFromMillions(data.latestTotalUsdMillions)}
                />
                {data.banks.map((bank) => (
                  <StatTile
                    key={bank.id}
                    label={bank.label}
                    value={formatUsdFromMillions(
                      bank.series[bank.series.length - 1]?.usdMillions
                    )}
                    asOf={bank.series[bank.series.length - 1]?.date}
                  />
                ))}
              </div>
              <StackedAreaChart
                data={mergeByDate(data.banks)}
                groups={data.banks.map((b) => ({ id: b.id, label: b.label }))}
              />
            </>
          )}
        </AsyncBoundary>
      </Section>

      <Section
        title="글로벌 M2 통화량"
        desc="미국 / 유로존 / 중국 / 일본 M2를 USD로 환산해 합산했습니다."
      >
        <AsyncBoundary state={globalM2}>
          {(data) => (
            <>
              <div className="grid tiles-grid" style={{ marginBottom: 16 }}>
                <StatTile
                  label="글로벌 M2 합계"
                  value={formatUsdFromMillions(data.latestTotalUsdMillions)}
                />
                {data.countries.map((c) => (
                  <StatTile
                    key={c.id}
                    label={c.label}
                    value={formatUsdFromMillions(
                      c.series[c.series.length - 1]?.usdMillions
                    )}
                    asOf={c.series[c.series.length - 1]?.date}
                  />
                ))}
              </div>
              <StackedAreaChart
                data={mergeByDate(data.countries)}
                groups={data.countries.map((c) => ({ id: c.id, label: c.label }))}
              />
            </>
          )}
        </AsyncBoundary>
      </Section>

      <Section title="달러 인덱스 (DXY) & 주요 환율">
        <AsyncBoundary state={dxyFx}>
          {(data) => <DxyFxPanel dxy={data.dxy} fx={data.fx} />}
        </AsyncBoundary>
      </Section>

      <Section
        title="거래량 Top 10"
        desc="국내(KRX, 네이버 금융 비공식 소스)와 해외(Yahoo Finance 비공식 소스) 거래량 상위 종목."
      >
        <AsyncBoundary state={topVolume}>
          {(data) => (
            <div className="grid grid-2">
              {data.domestic.ok ? (
                <TopVolumeTable title="국내 거래량 Top 10" rows={data.domestic.rows} />
              ) : (
                <div className="card error-box">국내 데이터 오류: {data.domestic.error}</div>
              )}
              {data.global.ok ? (
                <TopVolumeTable title="해외 거래량 Top 10" rows={data.global.rows} />
              ) : (
                <div className="card error-box">해외 데이터 오류: {data.global.error}</div>
              )}
            </div>
          )}
        </AsyncBoundary>
      </Section>
    </div>
  );
}
