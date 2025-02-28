import { ethers } from "ethers"

function Header({ account, setAccount }) {

  async function connectHandler(){ 
    if (!window.ethereum) return alert("Metamask not installed");

    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    console.log("account", accounts);
    const account = ethers.getAddress(accounts[0])
    console.log(account);
    setAccount(account);
  }

  return (
    <header>
      <p className="brand">fun.pump</p>

      {account ? (
        <button className="btn--fancy">[ {account.slice(0, 6) + '...' + account.slice(38, 42)} ]</button>
      ) : (
        <button onClick={connectHandler} className="btn--fancy"> [connect] </button>
      )}
    </header>
  );
}

export default Header;