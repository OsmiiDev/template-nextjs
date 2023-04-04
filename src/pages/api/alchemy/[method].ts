import {NextApiRequest, NextApiResponse} from 'next';
import {Network, Alchemy} from 'alchemy-sdk';

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
}; // Alchemy API key and network

export const alchemy = new Alchemy(config); // Creates an Alchemy instance to fetch NFT metadata


/**
 * @description - Alchemy proxy API
 * @param {NextApiRequest} req - Request object
 * @param {NextApiResponse} res - Response object
 * @return {Promise<void>}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query;

  // No method or query specified
  if (!query.method) {
    res.status(400).end();
    return;
  }
  if (!query) res.status(400).end();

  if (query.method === 'getNftMetadata') {
    if (!query.contractAddress || !query.tokenId) return res.status(400).end(); // No contract address or token ID specified
    const data = await alchemy.nft.getNftMetadata(query.contractAddress as string, query.tokenId as string).catch(() => null); // Get NFT metadata
    res.end(JSON.stringify(data || {error: true})); // Return error if no data is found
  } else if (query.method === 'getNftsForOwner') {
    if (!query.ownerAddress) return res.status(400).end(); // No owner address specified
    const data = await alchemy.nft.getNftsForOwner(query.ownerAddress as string).catch(() => null); // Get NFTs for owner
    res.end(JSON.stringify(data || {error: true})); // Return error if no data is found
  }
}
