import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 }
      );
    }

    // Fetch token data from the create-token API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/create-token?id=${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // If token is not found, create a mock token for demonstration
    const mockToken = {
      id,
      name: "Demo Token",
      symbol: "DEMO",
      description: "This is a demonstration token",
      imageUrl: "/placeholder.svg",
      initialSupply: "200000",
      maxSupply: "1000000",
      launchCost: "0.1",
      liquidityPercentage: "60",
      lockupPeriod: "180",
      chain: "ETH",
      createdAt: new Date().toISOString(),
      price: 0.00001 + Math.random() * 0.0001,
      priceChange: Math.random() * 20 - 10,
      marketCap: Math.floor(Math.random() * 1000000),
      volume24h: Math.floor(Math.random() * 100000),
      holders: Math.floor(Math.random() * 1000),
      circulatingSupply: 200000,
    };

    return NextResponse.json({
      success: true,
      token: mockToken,
    });
  } catch (error) {
    console.error("Get token error:", error);
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
}
