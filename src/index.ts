import "dotenv/config";

const COINGECKO_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";

const assets = [
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

interface MarketRow {
  name: string;
  price: string;
  change: string;
}

function createMarketRows(priceData: unknown): MarketRow[] {
  if (typeof priceData !== "object" || priceData === null) {
    throw new Error("CoinGecko yanıtı beklenen formatta değil.");
  }

  const prices = priceData as Record<string, unknown>;

  return assets.map((asset) => {
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
      price: usdFormatter.format(values.usd),
      change: `${values.usd_24h_change.toFixed(2)}%`,
    };
  });
}

function printMarketSnapshot(rows: MarketRow[]): void {
  const nameWidth = Math.max(...rows.map((row) => row.name.length));
  const priceWidth = Math.max(...rows.map((row) => row.price.length));
  const reportLines = rows.map(
    (row) =>
      `${row.name.padEnd(nameWidth)} | ${row.price.padEnd(priceWidth)} | 24h: ${row.change}`,
  );

  console.log(`MARKET SNAPSHOT\n${reportLines.join("\n")}`);
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

  printMarketSnapshot(createMarketRows(priceData));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Hata: ${message}`);
  process.exitCode = 1;
});
