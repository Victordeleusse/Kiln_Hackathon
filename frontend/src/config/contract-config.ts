export const OPTION_MANAGER_ADDRESS = '0xA93601b81A3a490a921a38a114384cC0Ed1b7816'; // Your contract address
export const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // USDC address on Sepolia

export const optionManagerABI = [{"inputs":[{"internalType":"address","name":"_usdcAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"OptionManager_AssetTransferFailedAtExpiry","type":"error"},{"inputs":[],"name":"OptionManager_USDCTransferFailedAtExpiry","type":"error"},{"inputs":[],"name":"OptionManager__BuyingPremiumTransferFailed","type":"error"},{"inputs":[],"name":"OptionManager__InitialTransferStrikePriceFundFailed","type":"error"},{"inputs":[],"name":"OptionManager__InsufficientAllowanceAssetBuyerPut","type":"error"},{"inputs":[],"name":"OptionManager__InsufficientAllowanceSellerPut","type":"error"},{"inputs":[],"name":"OptionManager__InsufficientAllowanceUSDCBuyerPut","type":"error"},{"inputs":[],"name":"OptionManager__InsufficientBalanceSellerPut","type":"error"},{"inputs":[],"name":"OptionManager__InsufficientBalanceUSDCBuyerPut","type":"error"},{"inputs":[],"name":"OptionManager__TransferAssetFailed","type":"error"},{"inputs":[],"name":"OptionManager__buyOptionFailed","type":"error"},{"inputs":[],"name":"OptionManager__callStrikeFailed","type":"error"},{"inputs":[],"name":"OptionManager__putStrikeFailed","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"optionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"}],"name":"AssetReclaimFromTheContract","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"optionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"}],"name":"AssetSentToTheContract","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"optionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"}],"name":"OptionBought","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"optionId","type":"uint256"},{"indexed":false,"internalType":"enum OptionManager.OptionType","name":"optionType","type":"uint8"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":false,"internalType":"uint256","name":"strikePrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"premium","type":"uint256"},{"indexed":false,"internalType":"address","name":"asset","type":"address"},{"indexed":false,"internalType":"uint256","name":"assetAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"expiry","type":"uint256"}],"name":"OptionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"optionId","type":"uint256"}],"name":"OptionDeleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"optionId","type":"uint256"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"}],"name":"OptionExercised","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[{"internalType":"uint256","name":"optionId","type":"uint256"}],"name":"buyOption","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"","type":"bytes"}],"name":"checkUpkeep","outputs":[{"internalType":"bool","name":"upkeepNeeded","type":"bool"},{"internalType":"bytes","name":"performData","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"strikePrice","type":"uint256"},{"internalType":"uint256","name":"premium","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"assetAmount","type":"uint256"}],"name":"createOptionPut","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"optionId","type":"uint256"}],"name":"deleteOptionPut","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"optionCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"options","outputs":[{"internalType":"enum OptionManager.OptionType","name":"optionType","type":"uint8"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"strikePrice","type":"uint256"},{"internalType":"uint256","name":"premium","type":"uint256"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"assetAmount","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"bool","name":"assetTransferedToTheContract","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"performData","type":"bytes"}],"name":"performUpkeep","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"optionId","type":"uint256"}],"name":"reclaimAssetFromContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"optionId","type":"uint256"}],"name":"sendERC20AssetToContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"optionId","type":"uint256"}],"name":"sendETHToContract","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"usdcAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}] as const;

export const erc20ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;
