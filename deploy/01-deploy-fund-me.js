// import
// function deployFunc(){
//     console.log("hi")

const { network } = require("hardhat")

const { networkConfig } = require("../helper-hardhat-config")

const { developmentChains } = require("../helper-hardhat-config")

// }
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if the contract doesn't exist, we deploy  a minimal version for our local testing
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.blockConfirmations || 1,
    })
}
module.exports.tags = ["all", "fundme"]
