# Kiln_Hackathon
## Table of Contents
1. [Overview](#overview)
2. [What is an Option?](#what-is-an-option)
3. [Benefits of Options for Staking](#benefits-of-options-for-staking)
4. [OptionManager Smart Contract Mechanics](#optionmanager-smart-contract-mechanics)
    - [Option Creation (Seller Perspective)](#option-creation-seller-perspective)
    - [Option Purchase (Buyer Perspective)](#option-purchase-buyer-perspective)
    - [Asset Submission & Exercise Decision](#asset-submission--exercise-decision)
    - [Automated Settlement via Chainlink Keepers](#automated-settlement-via-chainlink-keepers)
6. [Future Enhancements](#future-enhancements)
7. [Conclusion](#conclusion)

## Overview

OptionManager is a decentralized options trading smart contract designed to provide financial hedging mechanisms for users staking their assets. By leveraging options, users can protect their funds from market volatility while maintaining exposure to staking rewards. This smart contract is integrated with Chainlink Keepers to automate option settlement upon expiration.

## What is an Option?

An option is a financial derivative that grants the buyer the right, but not the obligation, to buy or sell an asset at a predetermined price (strike price) at the expiry date. Options are widely used for hedging against price volatility, speculation, and portfolio management.

There are two main types of options:

- **Call Option**: Grants the buyer the right to purchase an asset at the strike price before expiration.
- **Put Option**: Grants the buyer the right to sell an asset at the strike price before expiration.

## Benefits of Options for Staking

Staking involves locking up assets for a fixed period to earn rewards, exposing stakers to price fluctuations. Options allow stakers to hedge against downside risk by purchasing put options, ensuring they can sell their assets at a predetermined price even if the market drops.

For example, a staker earning rewards from Kiln may purchase a put option that extends beyond the staking period. If the asset's price drops during staking, the put option guarantees a minimum sale price, mitigating losses while maintaining staking yields.

## OptionManager Smart Contract Mechanics

The smart contract follows a structured flow to enable decentralized option trading:

### Option Creation (Seller Perspective)

A seller (option creator) creates a put option by specifying:

- **Strike Price**: The price at which the asset can be sold if exercised.
- **Premium**: The upfront cost paid by the buyer for the option.
- **Asset & Amount**: The asset type and amount the option covers.
- **Expiry Date**: The date when the option can be exercised.

The seller deposits the equivalent USDC of the strike price into the contract. This deposit acts as a guarantee for the buyer, ensuring the contract's credibility. However, instead of remaining idle, the seller has the opportunity to optimize capital efficiency by leveraging Spiko, a monetary fund that generates returns. This allows the seller to potentially earn passive income while still providing the required collateral.

### Option Purchase (Buyer Perspective)

A buyer (typically a staker) purchases the put option by paying the premium to the seller.

The buyer gains the right to sell the asset at the strike price at the date of the expiry.

### Asset Submission & Exercise Decision

The buyer decides whether to exercise the option by depositing the staked asset into the contract before expiration.

If the asset is deposited, the option is considered exercised.

### Automated Settlement via Chainlink Keepers

The smart contract integrates with Chainlink Keepers to automate option settlement upon expiration.
The buyer can deposit or withdraw the staked asset from the contract at any time before expiration.

At expiration, the contract's state determines the option's outcome:

- **If the asset is in the contract**: The option is exercised, the buyer receives the USDC equivalent to the strike price, and the seller receives the asset.

- **If the asset is not in the contract**: The option expires unexercised, the buyer keeps their asset, and the seller automatically recovers their USDC.

## Kiln Staking Data Integration

To enhance market efficiency and better align option offerings with demand, OptionManager integrates Kiln's staking data. This integration provides valuable insights into user activity and validator positions, allowing sellers to assess real-time market conditions. By leveraging this data, sellers can strategically create options based on actual staking trends, ensuring that supply meets demand effectively.

## Future Enhancements

- Support for call options to allow buyers to lock in asset purchase prices.
- Expansion to multi-chain environments for broader DeFi adoption.

## Conclusion
OptionManager provides a robust decentralized solution for hedging staked assets, reducing risk exposure while maintaining staking yields. By leveraging smart contracts, Chainlink automation, and ERC20 token security, it ensures seamless and trustless options trading.
