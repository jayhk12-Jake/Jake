# 데일리 글로벌 유동성 모니터링 대시보드

Fed 순유동성, 주요국 중앙은행 대차대조표, 글로벌 M2, 달러 인덱스(DXY)/환율,
국내·해외 거래량 Top 10을 한 화면에서 보여주는 대시보드입니다.

- `server/` — Express API. FRED에서 원본 시계열을 가져와 가공(USD 환산, 순유동성 계산 등)해 제공합니다.
- `client/` — Vite + React 프론트엔드. 5개 섹션(순유동성 / 중앙은행 대차대조표 / 글로벌 M2 / DXY·환율 / 거래량 Top 10)으로 구성됩니다.

## 빠른 시작

### 1. FRED API 키 발급

https://fred.stlouisfed.org/docs/api/api_key.html 에서 무료로 발급받을 수 있습니다.

```bash
cd server
cp .env.example .env
# .env 파일을 열어 FRED_API_KEY=발급받은키 로 수정
```

### 2. 서버 실행

```bash
cd server
npm install
npm run dev   # http://localhost:4000
```

### 3. 클라이언트 실행

```bash
cd client
npm install
npm run dev   # http://localhost:5173 (자동으로 /api를 4000 포트로 프록시)
```

브라우저에서 http://localhost:5173 접속.

## 아이폰에 앱처럼 설치하기 (PWA)

이 대시보드는 PWA(Progressive Web App)로 구성되어 있어, 별도의 App Store 배포 없이
아이폰 홈 화면에 앱처럼 설치할 수 있습니다.

1. 대시보드를 **HTTPS로 접근 가능한 주소**에 배포합니다 (아래 "배포" 참고). 서비스
   워커는 보안 컨텍스트(HTTPS 또는 localhost)에서만 동작합니다.
2. 아이폰 **Safari**로 그 주소에 접속합니다. (크롬 등 다른 브라우저는 홈 화면 추가가
   제한적입니다.)
3. 하단 공유 버튼 → **"홈 화면에 추가"** 선택.
4. 홈 화면에 생긴 아이콘을 실행하면 주소창 없이 전체화면 앱처럼 열립니다.

로컬 네트워크(같은 Wi-Fi)에서 테스트만 하고 싶다면 `npm run dev -- --host`로 서버를
띄우고 PC의 로컬 IP(예: `http://192.168.0.10:5173`)로 아이폰에서 접속하면 되지만,
이 경우 HTTP라서 서비스 워커(오프라인 캐시)는 등록되지 않고 홈 화면 아이콘/전체화면
실행만 됩니다.

### 배포(예시)

- 프론트엔드(`client/`): Vercel, Netlify, Cloudflare Pages 등에 `npm run build` 결과(`dist/`)를 정적 배포
- 백엔드(`server/`): Render, Railway, Fly.io 등에 배포하고 `FRED_API_KEY` 환경변수 설정
- 프론트엔드 빌드 시 `VITE_API_BASE=https://your-api-domain.com`을 지정하면
  `client/src/api.js`가 해당 주소로 API를 호출합니다 (미지정 시 상대경로 `/api`, dev 프록시용).

## 대시보드 구성

| 섹션 | 설명 | 데이터 소스 |
|---|---|---|
| Fed 순유동성 | Fed 총자산(WALCL) − 재무부 일반계정(TGA) − 익일 역레포(RRP) | FRED (공식 API, 키 필요) |
| 중앙은행 대차대조표 | Fed / ECB / BOJ / PBOC 총자산 USD 환산 합계 | FRED (공식 API, 키 필요) |
| 글로벌 M2 | 미국 / 유로존 / 중국 / 일본 M2 USD 환산 합계 | FRED (공식 API, 키 필요) |
| DXY & 환율 | 무역가중 달러지수(Broad) + USD/KRW, USD/JPY, EUR/USD, USD/CNY | FRED (공식 API, 키 필요) |
| 거래량 Top 10 (국내) | KRX 거래량 상위 종목 | 네이버 금융 페이지 파싱 (비공식) |
| 거래량 Top 10 (해외) | 미국 거래량 상위 종목 | Yahoo Finance screener 엔드포인트 (비공식) |

## 알아두어야 할 제약

- **DXY**: ICE가 발행하는 실제 달러 인덱스는 FRED에 없어, 대체 지표인
  "무역가중 달러지수(Broad, Goods & Services)"(`DTWEXBGS`)를 사용합니다. 완전히
  동일한 숫자는 아니지만 방향성은 매우 유사합니다.
- **PBOC/ECB 시리즈 ID**: `server/src/config/series.js`에 정리된 FRED 시리즈 ID
  중 일부(특히 PBOC `CHNASSETS`, ECB `ECBASSETSW`)는 FRED 개편에 따라 변경될
  수 있습니다. 데이터가 비어 있거나 이상하면 [FRED 사이트](https://fred.stlouisfed.org)에서
  검색해 해당 파일의 ID를 교체하세요.
- **거래량 Top 10**: 공식 API가 아닌 페이지 파싱/비공식 엔드포인트를 사용하므로
  네이버·Yahoo가 페이지 구조를 바꾸거나 접근을 제한하면 언제든 깨질 수 있습니다.
  실패 시 대시보드는 에러 메시지를 표시할 뿐 전체가 죽지 않도록 처리되어 있습니다.
- **이 개발 환경의 네트워크 제한**: 이 세션(샌드박스)은 아웃바운드 접속이
  패키지 레지스트리 등으로 제한되어 있어 FRED·네이버·Yahoo로의 실제 데이터
  호출을 이 환경에서는 테스트할 수 없었습니다. 코드/빌드 정상 동작(서버 기동,
  헬스체크, 에러 핸들링, 클라이언트 `vite build`)은 확인했지만, 실제 데이터가
  정상적으로 표시되는지는 인터넷이 열린 환경(로컬 PC 등)에서 직접 확인해
  주세요.

## 데이터 갱신 주기

- Fed 관련 시리즈: 서버에서 6시간 캐시 (원 데이터는 WALCL/TGA 주간, RRP 일간)
- 중앙은행 대차대조표: 6시간 캐시 (은행별로 실제 발표 주기가 다름 — Fed/BOJ 주간, ECB 주간, PBOC 월간 등)
- 글로벌 M2: 6시간 캐시 (원 데이터는 월간)
- DXY/환율: 6시간 캐시 (원 데이터는 일간)
- 거래량 Top 10: 30분 캐시 (장중 기준 실시간에 가깝게)

## 다음 단계로 고려할 만한 것

- FRED 시리즈 ID 검증 (특히 PBOC/ECB) 및 필요시 대체 소스 연결
- 배포 시 프론트/백엔드를 하나의 호스팅에 합치거나 (예: Vercel + Vercel Functions),
  백엔드를 별도 서버(Render, Railway 등)에 올리고 클라이언트 `VITE_API_BASE`로 연결
- 매일 자동 갱신을 원하면 `create_trigger`/cron으로 정기 새로고침 알림 설정 가능
