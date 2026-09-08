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

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Web application root element was not found.");
}

const marketCards = mockMarketData
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

app.innerHTML = `
  <main>
    <h1>Market Intelligence Agent</h1>
    <p class="demo-notice">Demo data — not live</p>
    <section class="market-grid" aria-label="Mock market data">
      ${marketCards}
    </section>
  </main>
`;
