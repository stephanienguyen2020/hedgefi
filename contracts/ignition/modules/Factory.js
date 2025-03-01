// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
// create  deployment script
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");

const FEE = ethers.parseUnits("0.01", 18)

module.exports = buildModule("FactoryModule", (m) => {
    // set up the fee for the factory contract
    const fee = m.getParameter("fee", FEE);
    const factory = m.contract("Factory", [FEE]);

    // Deploy Native Liquidity Pool Contract, passing the Factory address
    const liquidityPool = m.contract("NativeLiquidityPool", [factory]);

    // Set Liquidity Pool in Factory contract
    m.call(factory, "setLiquidityPool", [liquidityPool]);

    // return the contract
    return {factory, liquidityPool};
})
