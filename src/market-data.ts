const COINGECKO_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price";

export const supportedAssets = [
  { id: "bitcoin", name: "Bitcoin" },
  { id: "ethereum", name: "Ethereum" },
  { id: "solana", name: "Solana" },
] as const;

export type SupportedAsset = (typeof supportedAssets)[number];

export interface MarketRow {
  id: SupportedAsset["id"];
  name: SupportedAsset["name"];
  priceUsd: number;
  change24h: number;
}

function createMarketRows(
  priceData: unknown,
  selectedAssets: readonly SupportedAsset[],
): MarketRow[] {
  if (typeof priceData !== "object" || priceData === null) {
    throw new Error("CoinGecko yanıtı beklenen formatta değil.");
  }

  const prices = priceData as Record<string, unknown>;

  return selectedAssets.map((asset) => {
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
      id: asset.id,
      name: asset.name,
      priceUsd: values.usd,
      change24h: values.usd_24h_change,
    };
  });
}

export async function fetchMarketData(
  selectedAssets: readonly SupportedAsset[] = supportedAssets,
): Promise<MarketRow[]> {
  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
    throw new Error(
      "COINGECKO_API_KEY eksik. Anahtarı .env dosyasına ekleyin.",
    );
  }

  const requestUrl = new URL(COINGECKO_PRICE_URL);
  requestUrl.searchParams.set(
    "ids",
    selectedAssets.map((asset) => asset.id).join(","),
  );
  requestUrl.searchParams.set("vs_currencies", "usd");
  requestUrl.searchParams.set("include_24hr_change", "true");

  const response = await fetch(requestUrl, {
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

  return createMarketRows(priceData, selectedAssets);
}
