import { getDefaultProvider, Wallet, utils, Contract } from "ethers";
import { writeFile } from "fs/promises";

// ABI
import abi from "./abi.json" assert { type: "json" };
import erc20 from "./erc20.json" assert { type: "json" };

const wallets = [];

// Generate wallets
for (let i = 0; i < 10; i++) {
  const { address, privateKey } = Wallet.createRandom();
  console.log(`${address}: ${privateKey}`);
  wallets.push({ address, privateKey });
}

// Write them to file
await writeFile(`wallets-${Date.now()}.json`, JSON.stringify(wallets));

// Wallet setup
const provider = getDefaultProvider(process.env.RPC);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
const funder = new Contract(process.env.CONTRACT_ADDRESS, abi, wallet);
let tx;

// Approve BZZ
const token = new Contract(process.env.BZZ_ADDRESS, erc20, wallet);
tx = await token.approve(
  process.env.CONTRACT_ADDRESS,
  BigInt(wallets.length) * 5n * 10n ** 15n
);
await tx.wait();
console.log("Approve transaction mined");

// Fund them
tx = await funder.fund(
  wallets.map(({ address }) => address),
  { value: utils.parseEther("0.1").toBigInt() * BigInt(wallets.length) }
);

await tx.wait();
console.log("Funding transaction mined");
