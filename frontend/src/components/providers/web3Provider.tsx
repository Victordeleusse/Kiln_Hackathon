"use client"

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { http, WagmiProvider } from 'wagmi';
import {
  sepolia,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

export const config = getDefaultConfig({
  appName: 'My Wallet Connect',
  projectId: "6ea86adddd3f285b0710cc3ef5a59737",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://eth-sepolia.g.alchemy.com/v2/xoQYV6KR0NnDDVg6I57RJtAJnRXP5Sqm")
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: Readonly<{ children: React.ReactNode }>) {

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}  >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
