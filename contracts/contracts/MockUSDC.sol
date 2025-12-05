// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice A mock USDC token for local testing
 * @dev Has 6 decimals like real USDC
 */
contract MockUSDC is ERC20 {
    uint8 private constant _decimals = 6;

    constructor() ERC20("USD Coin", "USDC") {
        // Mint 1 million USDC to deployer for testing
        _mint(msg.sender, 1_000_000 * 10**_decimals);
    }

    function decimals() public pure override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Mint USDC to any address (for testing only)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Get testnet USDC - mints 1000 USDC to caller
     */
    function faucet() external {
        _mint(msg.sender, 1000 * 10**_decimals);
    }
}

