import { DuneClient } from "@duneanalytics/client-sdk";
import { DUNE_API_KEY } from "@/lib/constant";

const dune = new DuneClient(DUNE_API_KEY);

export async function getWalletList(): Promise<string[]> {
  const result = await dune.getLatestResult({ queryId: 4652328 });
  return result.result?.rows.map(row => row.staker) || [];
}
