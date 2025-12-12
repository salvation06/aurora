// blockchain.ts - Polkadot API initialization for Asset Hub Westend
import { ApiPromise, WsProvider } from "@polkadot/api";

let apiInstance: ApiPromise | null = null;

/**
 * Initialize connection to Polkadot Asset Hub (Westend testnet)
 * Reuses existing connection if already initialized
 */
export async function initPolkadot(): Promise<ApiPromise> {
  if (apiInstance && apiInstance.isConnected) {
    return apiInstance;
  }

  // Asset Hub Westend RPC endpoint
  const wsProvider = new WsProvider("wss://westend-asset-hub-rpc.polkadot.io");

  console.log("Connecting to Polkadot Asset Hub Westend...");
  apiInstance = await ApiPromise.create({ provider: wsProvider });

  await apiInstance.isReady;
  console.log("Connected to Polkadot Asset Hub Westend");

  return apiInstance;
}

/**
 * Disconnect from Polkadot API
 */
export async function disconnectPolkadot(): Promise<void> {
  if (apiInstance) {
    await apiInstance.disconnect();
    apiInstance = null;
    console.log("Disconnected from Polkadot");
  }
}

/**
 * Get current API instance (if connected)
 */
export function getPolkadotApi(): ApiPromise | null {
  return apiInstance;
}
