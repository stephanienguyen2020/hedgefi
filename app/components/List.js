import { ethers } from "ethers"
import { useState } from "react"
import { pinFileToIPFS, pinJSONToIPFS, unPinFromIPFS } from "../config/pinata";
import Factory from "../abis/Factory.json"
import { CONTRACT_ADDRESSES } from "../config/contracts_addresses";

function List({ toggleCreate, fee, provider, factory }) {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false)
  const [metaData, setMetaData] = useState({})
  
  // const { address } = useAccount();
  // const { data: walletClient } = useWalletClient();

  function handleFormChange(event){
    event.preventDefault();
    const { name, value } = event.target;
    setMetaData({ ...metaData, [name]: value });
  }

  // Handle image selection and create a preview
  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Generate a preview URL
    }
  }

  async function listHandler(event){
    setUploading(true);
    event.preventDefault(); //prevent the form from reloading the page

    console.log("Uploading File to IPFS", 'info', 1000);
    const imageIpfsHash  = await pinFileToIPFS(image);

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
      {value: fee} 
    );

    const receipt = await tx.wait();

    if (receipt.status === 1) {
      setUploading(false);
      toggleCreate(true)
    } else{
      // unpin the file
      await unPinFromIPFS(imageIpfsHash)
      await unPinFromIPFS(finalHash)
      setUploading(false);
    }
  }

  return (
    <div className="list">
      <h2>List New Token</h2>

      <div className="list_description">
        <p>fee: {ethers.formatUnits(fee, 18)} ETH</p>
      </div>

      <form onSubmit={listHandler}>
        <input type ="text" name="name" placeholder="Token Name" onChange={handleFormChange} required/>
        <input type ="text" name="ticker" placeholder="Token Symbol" onChange={handleFormChange} required/>
        <textarea 
          name="description" 
          placeholder="Token Description"
          onChange={handleFormChange}
          required>
        </textarea>
        <input type="file" accept="image/*" onChange={handleImageChange} required/>

        {/* Display the image preview */}
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Token Preview" />
          </div>
        )}
        <button type="submit" disabled={uploading} className="btn--fancy">
          {uploading ? "Pending..." : "[ List ]"}
        </button>
      </form>
      <button onClick={toggleCreate} className="btn--fancy">
        [cancel]
      </button>
    </div>
  );
}

export default List;