import { ethers } from "ethers";
import { pinFileToIPFS, pinJSONToIPFS, unPinFromIPFS } from "../config/pinata";
import Factory from "../abis/Factory.json";
import { CONTRACT_ADDRESSES } from "../config/contracts_addresses";

export async function createToken(metaData, image, fee, provider) {
    try {
      console.log("Uploading File to IPFS", 'info', 1000);
      const imageIpfsHash = await pinFileToIPFS(image);
  
      console.log("Uploading metadata to IPFS", 'info', 1000);
      const metadataURI = await pinJSONToIPFS({ ...metaData, imageURI: imageIpfsHash });
  
      const signer = await provider.getSigner();
      console.log("Signer Address:", await signer.getAddress());
  
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.TOKEN_FACTORY,
        Factory,
        signer
      );
  
      const tx = await contract.connect(signer).create(
        metaData.name,
        metaData.ticker,
        metadataURI,
        { value: fee }
      );
  
      const receipt = await tx.wait();
  
      if (receipt.status === 1) {
        return { success: true };
      } else {
        // Unpin the file if transaction fails
        await unPinFromIPFS(imageIpfsHash);
        await unPinFromIPFS(metadataURI);
        return { success: false };
      }
    } catch (error) {
      console.error("Error in listToken:", error);
      return { success: false, error };
    }
  }