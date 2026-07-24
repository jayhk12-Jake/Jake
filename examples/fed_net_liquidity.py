"""
Fed 순유동성(Net Liquidity) 미니 예제
공식: Fed 총자산(WALCL) - 재무부 일반계정(TGA, WTREGEN) - 익일 역레포(RRPONTSYD)

실행 전 준비:
    pip install requests matplotlib
    export FRED_API_KEY=발급받은_키   (https://fred.stlouisfed.org/docs/api/api_key.html)

실행:
    python fed_net_liquidity.py
"""

import os
import requests
import matplotlib.pyplot as plt

FRED_API_KEY = os.environ.get("FRED_API_KEY", "")
BASE_URL = "https://api.stlouisfed.org/fred/series/observations"


def fetch_series(series_id, limit=520):
    params = {
        "series_id": series_id,
        "api_key": FRED_API_KEY,
        "file_type": "json",
        "sort_order": "asc",
        "limit": limit,
    }
    res = requests.get(BASE_URL, params=params, timeout=15)
    res.raise_for_status()
    observations = res.json()["observations"]
    return [(o["date"], float(o["value"])) for o in observations if o["value"] != "."]


def forward_fill(base_dates, series):
    """base_dates 각 시점에서 series의 '직전 값'을 채워 넣는다 (주기가 다른 시계열 맞추기)."""
    series_by_date = dict(series)
    sorted_dates = sorted(series_by_date)
    result, idx, last_value = [], 0, None
    for date in base_dates:
        while idx < len(sorted_dates) and sorted_dates[idx] <= date:
            last_value = series_by_date[sorted_dates[idx]]
            idx += 1
        result.append(last_value)
    return result


def main():
    if not FRED_API_KEY:
        raise SystemExit("FRED_API_KEY 환경변수를 설정하세요.")

    print("FRED에서 데이터를 가져오는 중...")
    fed_assets = fetch_series("WALCL")   # 백만 달러, 주간
    tga = fetch_series("WTREGEN")        # 백만 달러, 주간
    rrp = fetch_series("RRPONTSYD")      # 십억 달러, 일간

    dates = [d for d, _ in fed_assets]
    assets = [v for _, v in fed_assets]
    tga_aligned = forward_fill(dates, tga)
    rrp_aligned = forward_fill(dates, [(d, v * 1000) for d, v in rrp])  # 십억 -> 백만

    net_liquidity = [
        a - t - r if t is not None and r is not None else None
        for a, t, r in zip(assets, tga_aligned, rrp_aligned)
    ]

    print(f"기준일: {dates[-1]}")
    print(f"Fed 순유동성: {net_liquidity[-1] / 1_000_000:.2f}조 달러")

    plt.figure(figsize=(10, 5))
    plt.plot(dates, net_liquidity, color="#2a78d6", linewidth=2)
    plt.title("Fed 순유동성 (Fed 총자산 - TGA - ON RRP)")
    plt.ylabel("백만 달러")
    plt.xticks(dates[::max(len(dates) // 12, 1)], rotation=45)
    plt.tight_layout()
    plt.savefig("fed_net_liquidity.png")
    print("차트를 fed_net_liquidity.png 로 저장했습니다.")


if __name__ == "__main__":
    main()
