import {
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import {
  sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'My Wallet Connect',
  projectId: "6ea86adddd3f285b0710cc3ef5a59737",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://shape-sepolia.g.alchemy.com/v2/KALyc7WPg-lCe8q7twsCHSf67bLe3Tt0"),
  },
  ssr: true,
});
