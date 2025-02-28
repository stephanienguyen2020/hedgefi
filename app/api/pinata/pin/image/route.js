import { NextResponse } from "next/server"; 
import { pinata } from "@/app/config/pinata";

export async function POST(req) {
    try {
      const formData = await req.formData();
      const file = formData.get("file");
  
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
  
      // Upload file to IPFS via Pinata
      const uploadData = await pinata.upload.file(file);
      return NextResponse.json({ hash: uploadData.IpfsHash }, { status: 200 });
    } catch (error) {
      console.error("Pinata Upload Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }