import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Simulate a token database with an array
// In a real application, this would be a database
let tokenDatabase: any[] = [];

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Creating token:", data);

    // Generate a unique ID for the token
    const tokenId = uuidv4();

    // Create a new token object
    const newToken = {
      id: tokenId,
      name: data.name,
      symbol: data.symbol,
      description: data.description || "",
      imageUrl: data.imageUrl,
      initialSupply: data.initialSupply || "200000",
      maxSupply: data.maxSupply || "1000000",
      launchCost: data.launchCost || "0.1",
      liquidityPercentage: data.liquidityPercentage || "60",
      lockupPeriod: data.lockupPeriod || "180",
      chain: data.chain || "ETH",
      createdAt: new Date().toISOString(),
      price: 0.00001 + Math.random() * 0.0001, // Random initial price
      priceChange: Math.random() * 20 - 10, // Random price change between -10% and +10%
      marketCap: Math.floor(Math.random() * 1000000), // Random market cap
      volume24h: Math.floor(Math.random() * 100000), // Random 24h volume
      holders: Math.floor(Math.random() * 1000), // Random number of holders
      circulatingSupply: parseInt(data.initialSupply) || 200000,
    };

    // Add the token to the database
    tokenDatabase.push(newToken);
    console.log("Token added to database:", newToken);

    return NextResponse.json({
      success: true,
      message: "Token created successfully",
      id: tokenId,
      token: newToken,
    });
  } catch (error) {
    console.error("Create token error:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}

// Add a GET function to retrieve token information
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 }
      );
    }

    // Find the token in the database
    const token = tokenDatabase.find((token) => token.id === id);

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Get token error:", error);
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
}
