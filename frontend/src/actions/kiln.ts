"use server"
import { getWalletList } from '@/lib/dune';
import { KILN_API_KEY } from '@/lib/constant';

const baseUrl = 'https://api.kiln.fi/v1/eth/onchain/v2/stakes';

export async function getEthOnchainStakes() {

  const walletList = await getWalletList();
  const walletsParam = walletList.join(',');

  try {
    //const eth = await fetch('https://api.diadata.org/v1/assetQuotation/Ethereum/0x0000000000000000000000000000000000000000')
    //const ethData = await eth.json();
    //const ethPrice = Number(ethData.Price.toFixed(2));
    //
    const ethPrice = 3249;
    const response = await fetch(`${baseUrl}?wallets=${walletsParam}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json; charset=utf-8',
        'authorization': `Bearer ${KILN_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const formattedData = data.data.map((item, index) => {
      return {
        id: index,
        owner: item.owner,
        contract: "0x0000000000000000000000000000000000000000",
        balance: (Number(item.balance) / 1e18),
        totalPrice: (Number(item.balance) / 1e18) * ethPrice
      }
    })
    return formattedData;
  } catch (error) {
    console.error('Error fetching stakes:', error);
    return null;
  }
}

