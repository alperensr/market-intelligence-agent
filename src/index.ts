import "dotenv/config";

const COINGECKO_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";

const selectedWatchlistAssets = [
  { id: "bitcoin", name: "Bitcoin" },
  { id: "ethereum", name: "Ethereum" },
  { id: "solana", name: "Solana" },
] as const;

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface WatchlistMarketRow {
  name: string;
  priceUsd: number;
  change24h: number;
}

interface WatchlistAnalysis {
  averageChange24h: number;
  bestPerformer: WatchlistMarketRow;
  worstPerformer: WatchlistMarketRow;
}

function formatPercentage(value: number): string {
  const roundedValue = Number(value.toFixed(2));
  const sign = roundedValue > 0 ? "+" : "";

  return `${sign}${roundedValue.toFixed(2)}%`;
}

function createWatchlistMarketRows(priceData: unknown): WatchlistMarketRow[] {
  if (typeof priceData !== "object" || priceData === null) {
    throw new Error("CoinGecko yanıtı beklenen formatta değil.");
  }

  const prices = priceData as Record<string, unknown>;

  return selectedWatchlistAssets.map((asset) => {
    const assetData = prices[asset.id];

    if (typeof assetData !== "object" || assetData === null) {
      throw new Error(`CoinGecko yanıtında ${asset.name} verisi bulunamadı.`);
    }

    const values = assetData as Record<string, unknown>;

    if (
      typeof values.usd !== "number" ||
      typeof values.usd_24h_change !== "number"
    ) {
      throw new Error(`CoinGecko yanıtındaki ${asset.name} verisi geçersiz.`);
    }

    return {
      name: asset.name,
      priceUsd: values.usd,
      change24h: values.usd_24h_change,
    };
  });
}

function calculateWatchlistAnalysis(
  rows: WatchlistMarketRow[],
): WatchlistAnalysis {
  if (rows.length === 0) {
    throw new Error("Seçili watchlist analiz edilemedi: Varlık bulunamadı.");
  }

  const totalChange24h = rows.reduce(
    (total, row) => total + row.change24h,
    0,
  );
  const bestPerformer = rows.reduce((best, row) =>
    row.change24h > best.change24h ? row : best,
  );
  const worstPerformer = rows.reduce((worst, row) =>
    row.change24h < worst.change24h ? row : worst,
  );

  return {
    averageChange24h: totalChange24h / rows.length,
    bestPerformer,
    worstPerformer,
  };
}

function printMarketSnapshot(rows: WatchlistMarketRow[]): void {
  const nameWidth = Math.max(...rows.map((row) => row.name.length));
  const formattedPrices = rows.map((row) => usdFormatter.format(row.priceUsd));
  const priceWidth = Math.max(...formattedPrices.map((price) => price.length));
  const reportLines = rows.map((row, index) => {
    const price = formattedPrices[index];

    return `${row.name.padEnd(nameWidth)} | ${price.padEnd(priceWidth)} | 24h: ${formatPercentage(row.change24h)}`;
  });

  console.log(`MARKET SNAPSHOT\n${reportLines.join("\n")}`);
}

function printWatchlistAnalysis(analysis: WatchlistAnalysis): void {
  const selectedNames = selectedWatchlistAssets
    .map((asset) => asset.name)
    .join(", ");

  console.log(`
WATCHLIST ANALYSIS
Scope: Selected watchlist only (${selectedNames})
Average 24h change: ${formatPercentage(analysis.averageChange24h)}
Best performer: ${analysis.bestPerformer.name} (${formatPercentage(analysis.bestPerformer.change24h)})
Worst performer: ${analysis.worstPerformer.name} (${formatPercentage(analysis.worstPerformer.change24h)})`);
}

async function main(): Promise<void> {
  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
    throw new Error(
      "COINGECKO_API_KEY eksik. Anahtarı .env dosyasına ekleyin.",
    );
  }

  const response = await fetch(COINGECKO_PRICE_URL, {
    headers: {
      "x-cg-demo-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `CoinGecko isteği başarısız oldu: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const priceData: unknown = await response.json();
  const watchlistRows = createWatchlistMarketRows(priceData);
  const watchlistAnalysis = calculateWatchlistAnalysis(watchlistRows);

  printMarketSnapshot(watchlistRows);
  printWatchlistAnalysis(watchlistAnalysis);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Hata: ${message}`);
  process.exitCode = 1;
});
