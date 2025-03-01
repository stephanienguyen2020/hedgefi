"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import GridBackground from "../components/GridBackground";
import { InputMethodSelector, type InputMethod } from "./input-method-selector";
import { AIInputForm } from "./ai-input-form";
import { RegenerationControls } from "./regeneration-controls";
import { TokenFormSection } from "./token-form";
import { useTokenStore, type Token } from "../store/tokenStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "../providers/WalletProvider";
import { ethers } from "ethers";
import Factory from "../abis/Factory.json";
import { config } from "../config.js";
import { pinFileToIPFS, pinJSONToIPFS, unPinFromIPFS } from "../lib/pinata";

interface TokenDetails {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
}

interface LaunchConfig {
  initialSupply: string;
  maxSupply: string;
  launchCost: string;
  liquidityPercentage: string;
  lockupPeriod: string;
}

export default function LaunchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [aiImageUrl, setAiImageUrl] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [launchConfig, setLaunchConfig] = useState<LaunchConfig>({
    initialSupply: "200000",
    maxSupply: "1000000",
    launchCost: "0.1",
    liquidityPercentage: "60",
    lockupPeriod: "180",
  });
  const [inputMethod, setInputMethod] = useState<InputMethod>("manual");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingDetails, setIsRegeneratingDetails] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [generatedDetails, setGeneratedDetails] = useState<TokenDetails | null>(
    null
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdToken, setCreatedToken] = useState<Token | null>(null);
  const addToken = useTokenStore((state) => state.addToken);
  const [uploading, setUploading] = useState(false);

  const { address, provider, chainId } = useWallet();

  // Initialize factory with a default value
  let factory: ethers.Contract | null = null;
  let fee = ethers.parseEther("0.1"); // Default fee - ethers v6 syntax

  if (chainId !== null) {
    const chainIdString = String(chainId);
    // Check if the chainId exists in the config
    if (chainIdString in config) {
      factory = new ethers.Contract(
        config[chainIdString as keyof typeof config].factory.address,
        Factory,
        provider
      );
    } else {
      console.error(`Chain ID ${chainIdString} not found in config`);
    }
  }

  // Wrapper functions to match the expected types for TokenFormSection
  const pinFileWrapper = async (file: File): Promise<string> => {
    const result = await pinFileToIPFS(file);
    if (result === null) {
      throw new Error("Failed to pin file to IPFS");
    }
    return result;
  };

  const pinJSONWrapper = async (metadata: any): Promise<string> => {
    const result = await pinJSONToIPFS(metadata);
    if (result === null) {
      throw new Error("Failed to pin JSON to IPFS");
    }
    return result;
  };

  const unPinWrapper = async (hash: string): Promise<void> => {
    await unPinFromIPFS(hash);
    // Return void as expected
  };

  const handleImageSelect = (file: File) => {
    setError("");
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAiImageUrl("");
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setAiImageUrl("");
    setError("");
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;

    try {
      setError("");
      setLoadingAI(true);

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const data = await response.json();
      setAiImageUrl(data.url);
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error generating image:", error);
      setError(
        "Failed to generate image. Please try again or upload an image manually."
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (data: Record<string, string>) => {
    try {
      if (!imageFile && !aiImageUrl) {
        setError("Please upload an image or generate one using AI");
        return;
      }

      setIsLoading(true);
      let imageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Failed to upload image");
        const result = await response.json();
        imageUrl = result.url;
        console.log("Uploaded image URL:", imageUrl); // Debug log
      } else if (aiImageUrl) {
        imageUrl = aiImageUrl;
        console.log("AI image URL:", imageUrl); // Debug log
      }

      if (!imageUrl) {
        throw new Error("Failed to process image");
      }

      // For development, if the API call would fail, use a local placeholder
      if (!imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
        imageUrl = "/placeholder.svg";
      }

      // Prepare token data for API
      const tokenData = {
        name: data.name,
        symbol: data.symbol,
        description: data.description || "",
        imageUrl: imageUrl,
        initialSupply: launchConfig.initialSupply,
        maxSupply: launchConfig.maxSupply,
        launchCost: launchConfig.launchCost,
        liquidityPercentage: launchConfig.liquidityPercentage,
        lockupPeriod: launchConfig.lockupPeriod,
        chain: data.chain || "ETH",
      };

      // Send token data to API
      const response = await fetch("/api/create-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tokenData),
      });

      if (!response.ok) {
        throw new Error("Failed to create token");
      }

      const responseData = await response.json();
      console.log("API response:", responseData); // Debug log

      // Create a new token object with the ID from the API response
      const newToken: Token = {
        id: responseData.id || Date.now().toString(),
        name: data.name,
        symbol: data.symbol,
        imageUrl, // Ensure imageUrl is set
        description: data.description || "",
        price: "$0.00",
        priceChange: 0,
        marketCap: "$0",
        holders: "0",
        volume24h: "$0",
        launchDate: new Date().toISOString().split("T")[0],
        chain: data.chain || "ETH",
        status: "active",
        fundingRaised: "0",
      };

      console.log("New token created:", newToken); // Debug log

      // Add token to store
      addToken(newToken);
      setCreatedToken(newToken);

      // Explicitly set the success dialog to show
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error creating token:", error);
      setError("Failed to create token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (input: string) => {
    try {
      setIsGenerating(true);
      setAiInput(input);

      const response = await fetch("/api/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          type: inputMethod === "ai-tweet" ? "tweet" : "idea",
        }),
      });

      if (!response.ok) throw new Error("Failed to generate token details");

      const data = await response.json();
      setGeneratedDetails(data);
      setPreviewUrl(data.imageUrl);
    } catch (error) {
      console.error("Error generating token:", error);
      setError("Failed to generate token details");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateDetails = async () => {
    if (!aiInput) return;
    setIsRegeneratingDetails(true);
    await handleGenerate(aiInput);
    setIsRegeneratingDetails(false);
  };

  const handleRegenerateImage = async () => {
    // Similar to handleRegenerateDetails but only for the image
    // You'll need to create a new API endpoint for this
  };

  const handleConfigChange = (key: keyof LaunchConfig, value: string) => {
    setLaunchConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <AppLayout showFooter={false}>
      <GridBackground />
      <div className="py-8">
        <div className="container max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <Badge variant="secondary" className="mb-4">
                Token Launch Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 text-transparent bg-clip-text">
                Launch Your Meme Token
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Create, deploy, and manage your meme token with our secure and
                automated platform. No coding required.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-primary/20 bg-background/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Create Your Token</CardTitle>
                <CardDescription>
                  Choose how you want to create your token
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <InputMethodSelector
                    selected={inputMethod}
                    onSelect={setInputMethod}
                  />

                  {(inputMethod === "ai-joke" ||
                    inputMethod === "ai-tweet") && (
                    <div className="space-y-6">
                      <AIInputForm
                        inputMethod={inputMethod}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                      />

                      {generatedDetails && (
                        <RegenerationControls
                          onRegenerateDetails={handleRegenerateDetails}
                          onRegenerateImage={handleRegenerateImage}
                          isRegeneratingDetails={isRegeneratingDetails}
                          isRegeneratingImage={isRegeneratingImage}
                        />
                      )}
                    </div>
                  )}

                  {(inputMethod === "manual" || generatedDetails) && (
                    <TokenFormSection
                      inputMethod={inputMethod}
                      generatedDetails={generatedDetails}
                      error={error}
                      imageFile={imageFile}
                      previewUrl={previewUrl}
                      aiImageUrl={aiImageUrl}
                      prompt={prompt}
                      loadingAI={loadingAI}
                      isLoading={isLoading}
                      launchConfig={launchConfig}
                      setUploading={setUploading}
                      provider={provider}
                      factory={factory}
                      fee={fee}
                      pinFileToIPFS={pinFileWrapper}
                      pinJSONToIPFS={pinJSONWrapper}
                      unPinFromIPFS={unPinWrapper}
                      onImageSelect={handleImageSelect}
                      onClearImage={clearImage}
                      onPromptChange={setPrompt}
                      onGenerateImage={generateImage}
                      onSubmit={handleSubmit}
                      onConfigChange={handleConfigChange}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              Token Created Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {createdToken && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {createdToken && (
                    <img
                      src={createdToken.imageUrl || "/placeholder.svg"}
                      alt={createdToken.name || "Token"}
                      className="h-12 w-12 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{createdToken?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {createdToken?.symbol}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccessDialog(false);
                  router.push("/dashboard/my-tokens");
                }}
              >
                View My Tokens
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccessDialog(false);
                  router.push(`/coins/${createdToken?.id}`);
                }}
              >
                View Token Details
              </Button>
              <Button
                onClick={() => {
                  setShowSuccessDialog(false);
                  router.push("/marketplace");
                }}
              >
                Go to Marketplace
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
