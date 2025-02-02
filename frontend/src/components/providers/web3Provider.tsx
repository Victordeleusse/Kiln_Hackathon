"use client"

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import {
  sepolia,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";


const config = getDefaultConfig({
  appName: 'My Wallet Connect',
  projectId: "6ea86adddd3f285b0710cc3ef5a59737",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://eth-sepolia.g.alchemy.com/v2/KALyc7WPg-lCe8q7twsCHSf67bLe3Tt0")
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
