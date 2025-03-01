import { Nabla } from "next/font/google";
import "./globals.css";
import { WagmiProvider} from 'wagmi';
import {config} from './config/wagmi';
const nabla = Nabla({ subsets: ['latin'] })

export const metadata = {
  title: "fun.pump",
  description: "create token listings",
};

// const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nabla.className}`}>
        {children}
      </body>
    </html>
  );
}
