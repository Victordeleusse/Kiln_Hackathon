import { ThemeProvider } from "@/components/providers/theme-provider"
import { Web3Provider } from "@/components/providers/web3Provider";


export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Web3Provider>
        {children}
      </Web3Provider>
    </ThemeProvider>
  </>;
}
