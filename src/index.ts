import "dotenv/config";

const COINGECKO_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";

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

  console.log(JSON.stringify(priceData, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Hata: ${message}`);
  process.exitCode = 1;
});
