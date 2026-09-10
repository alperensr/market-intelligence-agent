import "./style.css";

interface MockMarketCoin {
  name: string;
  symbol: string;
  priceUsd: number;
  change24h: number;
}

const mockMarketData: MockMarketCoin[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    priceUsd: 78_759,
    change24h: 1.17,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    priceUsd: 2_468.62,
    change24h: -0.46,
  },
  {
    name: "Solana",
    symbol: "SOL",
    priceUsd: 103.11,
    change24h: -2.54,
  },
];

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatChange(change24h: number): string {
  const sign = change24h > 0 ? "+" : "";

  return `${sign}${change24h.toFixed(2)}%`;
}

function createMarketCards(coins: MockMarketCoin[]): string {
  return coins
    .map((coin) => {
      const changeClass = coin.change24h >= 0 ? "positive" : "negative";

      return `
        <article class="market-card">
          <div class="coin-heading">
            <h2>${coin.name}</h2>
            <span>${coin.symbol}</span>
          </div>
          <p class="price">${usdFormatter.format(coin.priceUsd)}</p>
          <p class="change ${changeClass}">${formatChange(coin.change24h)} over 24 hours</p>
        </article>
      `;
    })
    .join("");
}

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Web application root element was not found.");
}

const assetOptions = mockMarketData
  .map((coin) => {
    const inputId = `asset-${coin.symbol.toLowerCase()}`;

    return `
      <label class="asset-option" for="${inputId}">
        <input id="${inputId}" type="checkbox" name="assets" value="${coin.symbol}" checked />
        <span>${coin.name} (${coin.symbol})</span>
      </label>
    `;
  })
  .join("");

app.innerHTML = `
  <main>
    <h1>Market Intelligence Agent</h1>
    <p class="demo-notice">Demo data — not live</p>
    <form id="analysis-form" class="analysis-form">
      <fieldset>
        <legend>Select assets</legend>
        <div class="asset-options">
          ${assetOptions}
        </div>
      </fieldset>
      <button type="submit">Analyze</button>
    </form>
    <section id="analysis-results" class="analysis-results" aria-live="polite">
      <p class="status-message">Select assets and run the analysis.</p>
    </section>
  </main>
`;

const analysisForm = document.querySelector<HTMLFormElement>("#analysis-form");
const analysisResults =
  document.querySelector<HTMLElement>("#analysis-results");

if (!analysisForm || !analysisResults) {
  throw new Error("Analysis form elements were not found.");
}

analysisForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedSymbols = new FormData(analysisForm).getAll("assets");
  const selectedCoins = mockMarketData.filter((coin) =>
    selectedSymbols.includes(coin.symbol),
  );

  if (selectedCoins.length === 0) {
    analysisResults.innerHTML = `
      <p class="validation-message" role="alert">
        Select at least one asset before running the analysis.
      </p>
    `;
    return;
  }

  analysisResults.innerHTML = `
    <div class="market-grid" aria-label="Mock market analysis results">
      ${createMarketCards(selectedCoins)}
    </div>
  `;
});
