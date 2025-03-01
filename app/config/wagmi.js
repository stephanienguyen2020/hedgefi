// import { getDefaultConfig, Chain } from "@rainbow-me/rainbowkit";
// import { http } from "viem";

// export const auroraTestnet = {
//   id: 1113042,
//   name: 'Aurora Testnet',
//   nativeCurrency: {
//     name: 'Ether',
//     symbol: 'ETH',
//     decimals: 18,
//   },
//   rpcUrls: {
//     default: {
//       http: [
//         "https://testnet.aurora.dev/",
//       ],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: 'Aurora Explorer',
//       url: 'https://explorer.testnet.aurora.dev',
//     },
//   },
//   testnet:true
// };

// export const config = getDefaultConfig({
//   chains: [auroraTestnet],
//   transports: {
//     [auroraTestnet.id]: http('https://testnet.aurora.dev'),
//   },
//   appName: "HedgeFi",
//   projectId: "16a843a30823aaf4aad941e21a0549a6",
// });