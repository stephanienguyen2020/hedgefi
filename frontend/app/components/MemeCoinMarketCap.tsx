"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, Sprout, TrendingUp, Eye } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { SparklineChart } from "./SparklineChart"
import type { Chain, FilterOption } from "./types"
import { MarketFilters } from "./MarketFilters"

const chains: Chain[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    id: "bsc",
    name: "BSC",
    logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  },
  {
    id: "solana",
    name: "Solana",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
  },
  {
    id: "polygon",
    name: "Polygon",
    logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
  },
  {
    id: "cardano",
    name: "Cardano",
    logo: "https://cryptologos.cc/logos/cardano-ada-logo.png",
  },
  {
    id: "optimism",
    name: "Optimism",
    logo: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png",
  },
  {
    id: "tron",
    name: "TRON",
    logo: "https://cryptologos.cc/logos/tron-trx-logo.png",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
  },
  {
    id: "ton",
    name: "TON",
    logo: "https://cryptologos.cc/logos/ton-ton-logo.png",
  },
]

type Coin = {
  name: string
  symbol: string
  price: number
  change1h: number
  change24h: number
  change7d: number
  marketCap: number
  volume24h: number
  circulatingSupply: number
  sparkline: number[]
}

const trendingCoins = [
  {
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.2455,
    change1h: -0.14,
    change24h: 1.58,
    change7d: -9.93,
    marketCap: 36379981120,
    volume24h: 885839156,
    circulatingSupply: 148.15e9,
    sparkline: [0.26, 0.25, 0.24, 0.25, 0.26, 0.25, 0.24, 0.23, 0.24, 0.25, 0.24, 0.245],
  },
  {
    name: "Shiba Inu",
    symbol: "SHIB",
    price: 0.00001558,
    change1h: -0.15,
    change24h: 2.68,
    change7d: -4.18,
    marketCap: 9183229003,
    volume24h: 146263727,
    circulatingSupply: 589.25e12,
    sparkline: [
      0.000016, 0.0000155, 0.0000158, 0.0000157, 0.0000156, 0.0000155, 0.0000157, 0.0000156, 0.0000155, 0.0000158,
      0.0000156, 0.00001558,
    ],
  },
  {
    name: "PEPE",
    symbol: "PEPE",
    price: 0.00009562,
    change1h: -0.44,
    change24h: 4.01,
    change7d: -3.98,
    marketCap: 4022751797,
    volume24h: 485824771,
    circulatingSupply: 420.68e12,
    sparkline: [
      0.000098, 0.000096, 0.000095, 0.000097, 0.000096, 0.000094, 0.000095, 0.000096, 0.000095, 0.000094, 0.000095,
      0.00009562,
    ],
  },
  {
    name: "TRUMP",
    symbol: "TRUMP",
    price: 16.48,
    change1h: -0.24,
    change24h: 2.43,
    change7d: -13.04,
    marketCap: 3297979858,
    volume24h: 576895263,
    circulatingSupply: 199.99e6,
    sparkline: [18.5, 17.8, 17.2, 16.8, 16.5, 16.2, 16.4, 16.3, 16.5, 16.4, 16.45, 16.48],
  },
  {
    name: "BONK",
    symbol: "BONK",
    price: 0.00001606,
    change1h: -0.26,
    change24h: 3.03,
    change7d: -10.52,
    marketCap: 1242482471,
    volume24h: 72068303,
    circulatingSupply: 77.34e12,
    sparkline: [
      0.0000165, 0.0000162, 0.0000161, 0.000016, 0.0000159, 0.0000161, 0.000016, 0.0000161, 0.0000159, 0.000016,
      0.0000161, 0.00001606,
    ],
  },
] as const

const filterOptions: FilterOption[] = [
  { id: "new", label: "New", icon: Sprout },
  { id: "gainers", label: "Gainers", icon: TrendingUp },
  { id: "visited", label: "Most Visited", icon: Eye },
] as const

export function MemeCoinMarketCap() {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [activeFilter, setActiveFilter] = useState<"new" | "gainers" | "visited">("new")
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null)
  const itemsPerPage = 5

  // Filter and sort coins based on active filter
  const filteredCoins = useMemo(() => {
    let filtered = [...trendingCoins]

    switch (activeFilter) {
      case "new":
        filtered = filtered.sort((a, b) => b.marketCap - a.marketCap)
        break
      case "gainers":
        filtered = filtered.sort((a, b) => b.change24h - a.change24h)
        break
      case "visited":
        filtered = filtered.sort((a, b) => b.volume24h - a.volume24h)
        break
    }

    return filtered
  }, [activeFilter])

  const totalPages = Math.ceil(filteredCoins.length / itemsPerPage)

  const getCurrentPageItems = () => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredCoins.slice(start, end)
  }

  return (
    <section className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <MarketFilters
          chains={chains}
          filterOptions={filterOptions}
          selectedChain={selectedChain}
          activeFilter={activeFilter}
          onChainSelect={setSelectedChain}
          onFilterSelect={setActiveFilter}
        />

        {/* Table section */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4">#</th>
                <th className="text-left py-4 px-4">Name</th>
                <th className="text-right py-4 px-4">Price</th>
                <th className="text-right py-4 px-4">1h %</th>
                <th className="text-right py-4 px-4">24h %</th>
                <th className="text-right py-4 px-4">7d %</th>
                <th className="text-right py-4 px-4">Market Cap</th>
                <th className="text-right py-4 px-4">Volume(24h)</th>
                <th className="text-right py-4 px-4">Circulating Supply</th>
                <th className="text-right py-4 px-4">Last 7 Days</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentPageItems().map((coin, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-900/50">
                  <td className="py-4 px-4 text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{coin.name}</span>
                      <span className="text-gray-400 text-sm">{coin.symbol}</span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4">${coin.price.toFixed(8)}</td>
                  <td className={`text-right py-4 px-4 ${coin.change1h > 0 ? "text-green-500" : "text-red-500"}`}>
                    {coin.change1h > 0 ? (
                      <ArrowUp className="inline h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4" />
                    )}
                    {Math.abs(coin.change1h)}%
                  </td>
                  <td className={`text-right py-4 px-4 ${coin.change24h > 0 ? "text-green-500" : "text-red-500"}`}>
                    {coin.change24h > 0 ? (
                      <ArrowUp className="inline h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4" />
                    )}
                    {Math.abs(coin.change24h)}%
                  </td>
                  <td className={`text-right py-4 px-4 ${coin.change7d > 0 ? "text-green-500" : "text-red-500"}`}>
                    {coin.change7d > 0 ? (
                      <ArrowUp className="inline h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4" />
                    )}
                    {Math.abs(coin.change7d)}%
                  </td>
                  <td className="text-right py-4 px-4">${coin.marketCap.toLocaleString()}</td>
                  <td className="text-right py-4 px-4">
                    <div className="flex flex-col items-end">
                      <span>${coin.volume24h.toLocaleString()}</span>
                      <span className="text-sm text-gray-400">
                        {(coin.volume24h / coin.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                        {coin.symbol}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4">
                    {coin.circulatingSupply.toLocaleString()} {coin.symbol}
                  </td>
                  <td className="py-4 px-4">
                    <SparklineChart data={coin.sparkline} color={coin.change7d > 0 ? "#22c55e" : "#ef4444"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </motion.div>
    </section>
  )
}

