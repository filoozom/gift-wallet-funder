import dotenv from "dotenv";
import { getDefaultProvider, Wallet, Contract } from "ethers";
import { writeFile } from "fs/promises";

// ABI
import abi from "./abi.json" assert { type: "json" };
import erc20 from "./erc20.json" assert { type: "json" };

// Env
dotenv.config();
const {
  RPC,
  PRIVATE_KEY,
  CONTRACT_ADDRESS,
  BZZ_ADDRESS,
  TOKEN_AMOUNT,
  NATIVE_AMOUNT,
  WALLET_COUNT,
} = process.env;

const wallets = [];

// Generate wallets
for (let i = 0; i < WALLET_COUNT; i++) {
  const { address, privateKey } = Wallet.createRandom();
  console.log(`${address}: ${privateKey}`);
  wallets.push({ address, privateKey });
}

// Write them to file
await writeFile(`wallets/wallets-${Date.now()}.json`, JSON.stringify(wallets));

// Wallet setup
const provider = getDefaultProvider(RPC);
const wallet = new Wallet(PRIVATE_KEY, provider);
const funder = new Contract(CONTRACT_ADDRESS, abi, wallet);
let tx;

// Approve BZZ
const token = new Contract(BZZ_ADDRESS, erc20, wallet);
tx = await token.approve(
  CONTRACT_ADDRESS,
  BigInt(TOKEN_AMOUNT) * BigInt(wallets.length)
);
await tx.wait();
console.log("Approve transaction mined");

// Fund them
tx = await funder.fund(
  BZZ_ADDRESS,
  TOKEN_AMOUNT,
  NATIVE_AMOUNT,
  wallets.map(({ address }) => address),
  { value: BigInt(NATIVE_AMOUNT) * BigInt(wallets.length) }
);

await tx.wait();
console.log("Funding transaction mined");
