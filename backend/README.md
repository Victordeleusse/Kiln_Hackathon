## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Project initialisation > creer un nouveau projet

```shell
$ forge init
```

```shell
$ foundryup
```

### Libraries installation > installe des bibliotheques

```shell
$ forge install OpenZeppelin/openzeppelin-contracts
```

### Remapping > enumerer les bibliotheques installees

```shell
$ forge remappings
```

### Clean > supprimer tous les fichiers compiles

```shell
$ forge clean
```

### Build > compiler tous les contrats -> obtenir bytecode dans out/

```shell
$ forge build
```

### Test > executer tous les tests / un test specifique : --match-path test/MonContrat.t.sol / -vvv : augmenter verbosite log

```shell
$ forge test
```

### Format > verifier les problemes de code

```shell
$ forge fmt
```

### Gas Snapshots > verifier les gas estime pour une fonction

```shell
$ forge snapshot
```

### Anvil > lancer un reseau local

```shell
$ anvil
```

### Config > obtenir informations sur ce reseau

```shell
$ forge config
```

### Deploy > deployer contrat (apres config foundry.toml)

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key> --broadcast
```
OU

```shell
$ forge create --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY src/MonContrat.sol:NomDuContrat
```

EN LOCAL

```shell
$ forge create --rpc-url http://127.0.0.1:8545 --private-key <CLE_PRIVEE> src/<NomDuContrat>.sol:<NomDuContrat>
```

### Cast > interagir avec le contrat deploye

```shell
$ cast call <ADRESSE_CONTRAT> "fonction(uint256)" 42 --rpc-url $SEPOLIA_RPC_URL

```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

### Summary to deploy a contract :
```shell
$ forge script script/DeployFactory.s.sol:DeployFactory --rpc-url ALCHEMY_SEPOLIA_URL --private-key PRIVATE_KEY --broadcast

$ forge verify-contract --chain-id 11155111 --num-of-optimizations 200 --compiler-version v0.8.28 --watch CONTRACT_ADDRESS src/ContractFile.sol:Contract --etherscan-api-key ETHERSCAN_KEY --constructor-args 0x00000000000000000000000000000000000000000000003635c9adc5dea00000
```

#### With constructor-args :
```shell
$ cast abi-encode "constructor(<type1>, <type2>)" <Arg1> <Arg2>
```

# addresse : 0x6d8Cf76ab79Be96147F8c4853d367eb62e4fAB50