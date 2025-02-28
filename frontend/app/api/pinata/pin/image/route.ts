import { pinata } from "@/app/lib/pinata";
import { NextResponse } from "next/server"; 

export async function POST(req: Request): Promise<NextResponse> {
    try {
      const contentType = req.headers.get("content-type") || "";
      if (!contentType.includes("multipart/form-data")) {
          return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
      }

      const formData = await req.formData();
      const file = formData.get("file") as File | null;;
  
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
  
      // Upload file to IPFS via Pinata
      const arrayBuffer = await file.arrayBuffer();
      const fileObject = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        arrayBuffer: async () => arrayBuffer
      };

      const uploadData = await pinata.upload.file(fileObject);
      
      return NextResponse.json({ hash: uploadData.IpfsHash }, { status: 200 });
    } catch (error) {
      console.error("Pinata Upload Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }