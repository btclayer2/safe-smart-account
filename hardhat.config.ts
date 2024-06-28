import "@nomiclabs/hardhat-ethers";
import type { HardhatUserConfig, HttpNetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "hardhat-deploy";
import dotenv from "dotenv";
import yargs from "yargs";
import { getSingletonFactoryInfo } from "@gnosis.pm/safe-singleton-factory";

const argv = yargs
    .option("network", {
        type: "string",
        default: "hardhat",
    })
    .help(false)
    .version(false).argv;

// Load environment variables.
dotenv.config();
const { NODE_URL, INFURA_KEY, MNEMONIC, ETHERSCAN_API_KEY, PK, SOLIDITY_VERSION, SOLIDITY_SETTINGS } = process.env;

const DEFAULT_MNEMONIC = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const sharedNetworkConfig: HttpNetworkUserConfig = {};
if (PK) {
    sharedNetworkConfig.accounts = [PK];
} else {
    sharedNetworkConfig.accounts = {
        mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
    };
}

if (["mainnet", "rinkeby", "kovan", "goerli", "ropsten", "mumbai", "polygon"].includes(argv.network) && INFURA_KEY === undefined) {
    throw new Error(`Could not find Infura key in env, unable to connect to network ${argv.network}`);
}

import "./src/tasks/local_verify";
import "./src/tasks/deploy_contracts";
import "./src/tasks/show_codesize";
import { BigNumber } from "@ethersproject/bignumber";
import { DeterministicDeploymentInfo } from "hardhat-deploy/dist/types";

const primarySolidityVersion = SOLIDITY_VERSION || "0.7.6";
const soliditySettings = SOLIDITY_SETTINGS ? JSON.parse(SOLIDITY_SETTINGS) : undefined;

const deterministicDeployment = (network: string): DeterministicDeploymentInfo => {
    // const info = getSingletonFactoryInfo(parseInt(network));
    // if (!info) {
    //     throw new Error(`
    //     Safe factory not found for network ${network}. You can request a new deployment at https://github.com/safe-global/safe-singleton-factory.
    //     For more information, see https://github.com/safe-global/safe-contracts#replay-protection-eip-155
    //   `);
    // }
    // return {
    //     factory: info.address,
    //     deployer: info.signerAddress,
    //     funding: BigNumber.from(info.gasLimit).mul(BigNumber.from(info.gasPrice)).toString(),
    //     signedTx: info.transaction,
    // };

    // # bevm-testnet(11503)
    // return {
    //     factory: "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7",
    //     deployer: "0xE1CB04A0fA36DdD16a06ea828007E35e1a3cBC37",
    //     funding: BigNumber.from(50000000).mul(BigNumber.from(101616)).toString(),
    //     signedTx: "0xf8a6808402faf08083018cf08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3825a02a0f8ea5f1212ae52173f4b9b99bd18b62e0555da845834081215993317b48b3e1ca0757bd526f59d74395ede30cde3ab630fee4a9147e05081d700cf8d92d8cc16b0",
    // };

    // # bevm-mainnet(11501)
    return {
        factory: "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7",
        deployer: "0xE1CB04A0fA36DdD16a06ea828007E35e1a3cBC37",
        funding: BigNumber.from(50000000).mul(BigNumber.from(101616)).toString(),
        signedTx: "0xf8a6808402faf08083018cf08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf38259fea0cd0786c5a8e7d2bb2575763be83434e8b6a1db63d6cc6afa405b6615569ec830a055d1f40376d1109a62e822e60e4312af9549ce13b93a21bd0b022f7bbd477047",
    };
};

const userConfig: HardhatUserConfig = {
    paths: {
        artifacts: "build/artifacts",
        cache: "build/cache",
        deploy: "src/deploy",
        sources: "contracts",
    },
    solidity: {
        compilers: [{ version: primarySolidityVersion, settings: soliditySettings }, { version: "0.6.12" }, { version: "0.5.17" }],
    },
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
            blockGasLimit: 100000000,
            gas: 100000000,
        },
        mainnet: {
            ...sharedNetworkConfig,
            url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
        },
        gnosis: {
            ...sharedNetworkConfig,
            url: "https://rpc.gnosischain.com",
        },
        ewc: {
            ...sharedNetworkConfig,
            url: `https://rpc.energyweb.org`,
        },
        goerli: {
            ...sharedNetworkConfig,
            url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
        },
        mumbai: {
            ...sharedNetworkConfig,
            url: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
        },
        polygon: {
            ...sharedNetworkConfig,
            url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
        },
        volta: {
            ...sharedNetworkConfig,
            url: `https://volta-rpc.energyweb.org`,
        },
        bsc: {
            ...sharedNetworkConfig,
            url: `https://bsc-dataseed.binance.org/`,
        },
        arbitrum: {
            ...sharedNetworkConfig,
            url: `https://arb1.arbitrum.io/rpc`,
        },
        fantomTestnet: {
            ...sharedNetworkConfig,
            url: `https://rpc.testnet.fantom.network/`,
        },
        avalanche: {
            ...sharedNetworkConfig,
            url: `https://api.avax.network/ext/bc/C/rpc`,
        },
    },
    deterministicDeployment,
    namedAccounts: {
        deployer: 0,
    },
    mocha: {
        timeout: 2000000,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
};
if (NODE_URL) {
    userConfig.networks!.custom = {
        ...sharedNetworkConfig,
        url: NODE_URL,
    };
}
export default userConfig;
