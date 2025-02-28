"use client"

import { use, useEffect, useState } from "react"
import { ethers } from 'ethers'

// Components
import Header from "./components/Header"
import List from "./components/List"
import Token from "./components/Token"
import Trade from "./components/Trade"

// ABIs & Config
import Factory from "./abis/Factory.json"
import NativeLiquidityPool from "./abis/NativeLiquidityPool.json"
import config from "./config.json"

export default function Home() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [fee, setFee] = useState(null)
  const [factory, setFactory] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [tokens, setTokens] = useState([]) 
  const [token, setToken] = useState(null)
  const [showTrade, setShowTrade] = useState(false)

  function toggleCreate(refresh=false) {
    showCreate ? setShowCreate(false) : setShowCreate(true)
    
    if (refresh) {
      loadBlockchainData();
    }
  }

  function toggleTrade(token, refresh=false) {
    setToken(token)
    showTrade ? setShowTrade(false) : setShowTrade(true)

    if (refresh) {
      loadBlockchainData();
    }
  }

  async function fetchMetadata(metadataURI) {
    if (!metadataURI) return { name: "Unknown", description: "", imageURI: "" };

    try {
      const response = await fetch(metadataURI);
      if (!response.ok) throw new Error("Failed to fetch metadata");
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch metadata for ${metadataURI}:`, error);
      return { name: "Unknown", description: "No description available", imageURI: "" };
    }
  }

  async function loadBlockchainData(){
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    console.log("Network Chain ID:", network.chainId);
    
    const factory = new ethers.Contract(config[network.chainId].factory.address, Factory, provider)
    setFactory(factory)
    console.log("factory", factory)
    // fetch the fee of the deployed app
    const fee = await factory.fee()
    console.log("fee", fee)
    setFee(fee)

    // Prepare to fetch token details
    const totalTokens = await factory.totalTokens()
    const tokens = []

    for (let i = 0; i < totalTokens; ++i){
      const tokenSale = await factory.getTokenSale(i);
      const metadata = await fetchMetadata(tokenSale.metadataURI);

      const token = {
        token: tokenSale.token,
        name: tokenSale.name,
        creator: tokenSale.creator,
        sold: tokenSale.sold,
        raised: tokenSale.raised,
        isOpen: tokenSale.isOpen,
        image: metadata.imageURI,
        description: metadata.description
      }
      tokens.push(token)
    }

    setTokens(tokens.reverse())
    console.log(tokens)
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div className="page">
      <Header account={account} setAccount={setAccount}/>

      <main>
        <div className="create">
          <button onClick={factory && account && toggleCreate} className="btn--fancy">
            {!factory ? (
              "[ contract not deployed ]"
            ) : !account ? (
              "[please connect your wallet]"
            ) : (
              "[start a new token]"
            )
            }
          </button>
        </div>

        <div className="listings">
            <h1>new listings</h1>

            <div className="tokens">
              {!account ? (
                <p>please connect your wallet</p>
              ) : tokens.length === 0 ? (
                <p>No tokens listed</p>
              ) : (
                tokens.map((token,index) => (
                  <Token 
                    toggleTrade= {toggleTrade}
                    token={token}
                    key={index}
                  /> 
              ))
            )}
            </div>
        </div>
      </main>

      {showCreate && (
        <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory}/>
      )}

      {showTrade && (
        <Trade toggleTrade={toggleTrade} token={token} provider={provider} factory={factory}/>
      )}
    </div>
  );
}
