require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("hardhat-gas-reporter")

/** @type import('hardhat/config').HardhatUserConfig */
const GOERLI_RPC_URL =
    "https://eth-goerli.g.alchemy.com/v2/NQO-ZDsOvn_qCI-AeX-c88TbNSc7_nUh"
const PRIVATE_KEY =
    "0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a"
const sepolia_KEY =
    "92b427117b02d211c1304dfaa64dd51eff2a61f3cabfccbcc948c922200f32e5"
// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const ETHERSCAN_API_KEY = "ZZPYEBCZQ75TMRVRN1KA71G8RZ136ZB864"
const COINMARKETCAP_API_KEY = "d528e707-3065-48dd-8f35-33e7be998d24"
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
            gasPrice: 35000000000,
        },
        sepolia: {
            url: "https://eth-sepolia.g.alchemy.com/v2/EUL8-23G1qq65fNFujjdjtTaAhjQb3uo",
            accounts: [sepolia_KEY],
            chainId: 11155111,
        },
    },
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },

    gasReporter: {
        enabled: true,
        // coinmarketcap: COINMARKETCAP_API_KEY,
        gasPriceApi:
            "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
    mocha: {
        timeout: 50000,
    },
}
