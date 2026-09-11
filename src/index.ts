import "dotenv/config";
import { fetchMarketData, type MarketRow } from "./market-data.js";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface WatchlistAnalysis {
  averageChange24h: number;
  bestPerformer: MarketRow;
  worstPerformer: MarketRow;
}

function formatPercentage(value: number): string {
  const roundedValue = Number(value.toFixed(2));
  const sign = roundedValue > 0 ? "+" : "";

  return `${sign}${roundedValue.toFixed(2)}%`;
}

function calculateWatchlistAnalysis(
  rows: MarketRow[],
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

function printMarketSnapshot(rows: MarketRow[]): void {
  const nameWidth = Math.max(...rows.map((row) => row.name.length));
  const formattedPrices = rows.map((row) => usdFormatter.format(row.priceUsd));
  const priceWidth = Math.max(...formattedPrices.map((price) => price.length));
  const reportLines = rows.map((row, index) => {
    const price = formattedPrices[index];

    return `${row.name.padEnd(nameWidth)} | ${price.padEnd(priceWidth)} | 24h: ${formatPercentage(row.change24h)}`;
  });

  console.log(`MARKET SNAPSHOT\n${reportLines.join("\n")}`);
}

function printWatchlistAnalysis(
  analysis: WatchlistAnalysis,
  rows: MarketRow[],
): void {
  const selectedNames = rows.map((row) => row.name).join(", ");

  console.log(`
WATCHLIST ANALYSIS
Scope: Selected watchlist only (${selectedNames})
Average 24h change: ${formatPercentage(analysis.averageChange24h)}
Best performer: ${analysis.bestPerformer.name} (${formatPercentage(analysis.bestPerformer.change24h)})
Worst performer: ${analysis.worstPerformer.name} (${formatPercentage(analysis.worstPerformer.change24h)})`);
}

async function main(): Promise<void> {
  const watchlistRows = await fetchMarketData();
  const watchlistAnalysis = calculateWatchlistAnalysis(watchlistRows);

  printMarketSnapshot(watchlistRows);
  printWatchlistAnalysis(watchlistAnalysis, watchlistRows);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Hata: ${message}`);
  process.exitCode = 1;
});
