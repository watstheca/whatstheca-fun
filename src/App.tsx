import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import './styles.css';

interface HintRequestedEvent {
    returnValues: {
        player: string;
        hintIndex: string;
    };
    event: string;
    signature: string;
    raw: {
        data: string;
        topics: string[];
    };
}

const jackpotGameABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_gameToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_bondingCurve",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_marketingWallet",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "total100X",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "sReceived",
        "type": "uint256"
      }
    ],
    "name": "BatchProcessed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "newCurve",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "requestTime",
        "type": "uint256"
      }
    ],
    "name": "BondingCurveChangeRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "ChangeCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "newGameToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newBondingCurve",
        "type": "address"
      }
    ],
    "name": "ChangeExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newGuessCost",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newHintCost",
        "type": "uint256"
      }
    ],
    "name": "CostsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "newAgent",
        "type": "address"
      }
    ],
    "name": "DefaiAgentUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "newToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "requestTime",
        "type": "uint256"
      }
    ],
    "name": "GameTokenChangeRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      }
    ],
    "name": "GameUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "commitment",
        "type": "bytes32"
      }
    ],
    "name": "GuessCommitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "guess",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "won",
        "type": "bool"
      }
    ],
    "name": "GuessRevealed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "HintAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "hintIndex",
        "type": "uint256"
      }
    ],
    "name": "HintRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "JackpotFunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "newWallet",
        "type": "address"
      }
    ],
    "name": "MarketingWalletUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newDelay",
        "type": "uint256"
      }
    ],
    "name": "RevealDelayUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "hashedSecret",
        "type": "bytes32"
      }
    ],
    "name": "SecretHashSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "burn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "jackpot",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "next",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "marketing",
        "type": "uint256"
      }
    ],
    "name": "SplitUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CHANGE_DELAY",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PASSWORD_SETTER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "accumulated100X",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "addHint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "batchInterval",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bondingCurve",
    "outputs": [
      {
        "internalType": "contract IBondingCurve",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "burnPercent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancelChange",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "changeRequest",
    "outputs": [
      {
        "internalType": "address",
        "name": "newGameToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "newBondingCurve",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "requestTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "commitBlocks",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_commitment",
        "type": "bytes32"
      }
    ],
    "name": "commitGuess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "commitments",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "defaiAgent",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      }
    ],
    "name": "emitGameUpdate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "executeChange",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fundJackpot",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gameToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSplit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "guessCost",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hintCost",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hintCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "jackpotAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "jackpotPercent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastBatchTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketingPercent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketingWallet",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextJackpotAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextJackpotPercent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "playerGuesses",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newCurve",
        "type": "address"
      }
    ],
    "name": "requestBondingCurveChange",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newToken",
        "type": "address"
      }
    ],
    "name": "requestGameTokenChange",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requestHint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "revealDelay",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_guess",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "_nonce",
        "type": "bytes32"
      }
    ],
    "name": "revealGuess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "salt",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "secretHash",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_minutes",
        "type": "uint256"
      }
    ],
    "name": "setBatchInterval",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_guessCost",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_hintCost",
        "type": "uint256"
      }
    ],
    "name": "setCosts",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_agent",
        "type": "address"
      }
    ],
    "name": "setDefaiAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newWallet",
        "type": "address"
      }
    ],
    "name": "setMarketingWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newDelay",
        "type": "uint256"
      }
    ],
    "name": "setRevealDelay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_hashedSecret",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "_newSalt",
        "type": "bytes32"
      }
    ],
    "name": "setSecretHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalGuesses",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_burn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_jackpot",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_next",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_marketing",
        "type": "uint256"
      }
    ],
    "name": "updateSplit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawJackpot",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

const token100xABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "spender", "type": "address" },
        { "internalType": "uint256", "name": "allowance", "type": "uint256" },
        { "internalType": "uint256", "name": "needed", "type": "uint256" }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "sender", "type": "address" },
        { "internalType": "uint256", "name": "balance", "type": "uint256" },
        { "internalType": "uint256", "name": "needed", "type": "uint256" }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [{ "internalType": "address", "name": "approver", "type": "address" }],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [{ "internalType": "address", "name": "receiver", "type": "address" }],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "address", "name": "spender", "type": "address" }
      ],
      "name": "allowance",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "spender", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "approve",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "transfer",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "from", "type": "address" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "value", "type": "uint256" }
      ],
      "name": "transferFrom",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

const bondingCurveABI = [
    {
      "inputs": [{ "internalType": "address", "name": "_token100x", "type": "address" }],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    { "inputs": [], "name": "EnforcedPause", "type": "error" },
    { "inputs": [], "name": "ExpectedPause", "type": "error" },
    {
      "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
        { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "sPaid", "type": "uint256" }
      ],
      "name": "Buy",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "sAmount", "type": "uint256" }
      ],
      "name": "FullTimelockWithdrawExecuted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "sAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "requestTime", "type": "uint256" }
      ],
      "name": "FullTimelockWithdrawRequested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [{ "internalType": "uint256", "name": "newPrice", "type": "uint256" }],
      "name": "InitialPriceUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [{ "internalType": "uint256", "name": "newIncrease", "type": "uint256" }],
      "name": "PriceIncreaseUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "seller", "type": "address" },
        { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "sReceived", "type": "uint256" }
      ],
      "name": "Sell",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [{ "internalType": "uint256", "name": "newFee", "type": "uint256" }],
      "name": "SellFeeUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "pool", "type": "address" },
        { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "sAmount", "type": "uint256" }
      ],
      "name": "SentToLiquidityPool",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "internalType": "uint256", "name": "totalBought", "type": "uint256" },
        { "internalType": "uint256", "name": "totalSoldBack", "type": "uint256" }
      ],
      "name": "ThresholdReached",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
      "name": "TokenTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MAX_TOKEN_AMOUNT_PER_TX",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "THRESHOLD",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "WITHDRAW_DELAY",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "balances",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }],
      "name": "buy",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cancelFullWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "executeFullTimelockWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fullTimelockWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPoolS",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "initialPrice",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "jackpotAddress",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "poolS",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "priceIncrease",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }],
      "name": "sell",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "sellFee",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "pool", "type": "address" },
        { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "sAmount", "type": "uint256" }
      ],
      "name": "sendToLiquidityPool",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "_newPrice", "type": "uint256" }],
      "name": "setInitialPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "_jackpotAddress", "type": "address" }],
      "name": "setJackpotAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "_newIncrease", "type": "uint256" }],
      "name": "setPriceIncrease",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "_fee", "type": "uint256" }],
      "name": "setSellFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "token100x",
      "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalBought",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSoldBack",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawRequest",
      "outputs": [
        { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "sAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "requestTime", "type": "uint256" },
        { "internalType": "bool", "name": "active", "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    { "stateMutability": "payable", "type": "receive" }
];


const JACKPOT_ADDRESS = '0x5D1c6D024B38666FBf0D2205722288Dd857AB6Fb';
const TOKEN_ADDRESS = '0x0388c8502CA45f04fA5f67a4596fE727c80290C5';
const BONDING_CURVE_ADDRESS = '0x31Ef1dF550F44FEc3c0285847Ccf8b2a1bc794Cc';
const SONIC_TESTNET_CHAIN_ID = '57054';
const SONIC_TESTNET_RPC_URL = 'https://rpc.blaze.soniclabs.com';
const HINT_API_URL = 'https://whatstheca.fun/.netlify/functions/get-hint';

// Define button style
const buttonStyle: React.CSSProperties = {
    margin: '5px',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
};

// Define interface for hint data
interface HintData {
    hint: string;
}

// Define interface for MetaMask error
interface MetaMaskError {
    code: number;
    message: string;
}

const App: React.FC = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [jackpotContract, setJackpotContract] = useState<any>(null);
    const [tokenContract, setTokenContract] = useState<any>(null);
    const [bondingContract, setBondingContract] = useState<any>(null);
    const [totalGuesses, setTotalGuesses] = useState<number>(0);
    const [jackpotAmount, setJackpotAmount] = useState<string>('0');
    const [nextJackpotAmount, setNextJackpotAmount] = useState<string>('0');
    const [playerGuesses, setPlayerGuesses] = useState<number>(0);
    const [guessCost, setGuessCost] = useState<string>('0');
    const [tokenBalance, setTokenBalance] = useState<string>('0');
    const [splits, setSplits] = useState<number[]>([0, 0, 0, 0]);
    const [guessInput, setGuessInput] = useState<string>('');
    const [nonce, setNonce] = useState<string>('');
    const [buyAmount, setBuyAmount] = useState<string>('');
    const [sellAmount, setSellAmount] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [hint, setHint] = useState<string | null>(null);

    const fetchGameStats = useCallback(async () => {
        if (jackpotContract && tokenContract && bondingContract && account && web3) {
            try {
                const guessesCall = await jackpotContract.methods.totalGuesses().call();
                if (!guessesCall || typeof guessesCall !== 'string') {
                    throw new Error("Failed to fetch total guesses");
                }
                const guesses = BigInt(guessesCall).toString();
                const jackpotCall = await jackpotContract.methods.jackpotAmount().call();
                if (!jackpotCall || typeof jackpotCall !== 'string') {
                    throw new Error("Failed to fetch jackpot amount");
                }
                const jackpot = jackpotCall;
                const nextJackpotCall = await jackpotContract.methods.nextJackpotAmount().call();
                if (!nextJackpotCall || typeof nextJackpotCall !== 'string') {
                    throw new Error("Failed to fetch next jackpot amount");
                }
                const nextJackpot = nextJackpotCall;
                const playerCall = await jackpotContract.methods.playerGuesses(account).call();
                if (!playerCall || typeof playerCall !== 'string') {
                    throw new Error("Failed to fetch player guesses");
                }
                const player = playerCall;
                const costCall = await jackpotContract.methods.guessCost().call();
                if (!costCall || typeof costCall !== 'string') {
                    throw new Error("Failed to fetch guess cost");
                }
                const cost = costCall;
                const balanceCall = await tokenContract.methods.balanceOf(account).call();
                if (!balanceCall || typeof balanceCall !== 'string') {
                    throw new Error("Failed to fetch token balance");
                }
                const balance = balanceCall;
                const splitCall = await jackpotContract.methods.getSplit().call();
                if (!splitCall || !Array.isArray(splitCall) || splitCall.length !== 4 || splitCall.some(val => typeof val !== 'string')) {
                    throw new Error("Failed to fetch split values");
                }
                const split = splitCall as [string, string, string, string];

                setTotalGuesses(parseInt(guesses));
                setJackpotAmount(web3.utils.fromWei(jackpot, 'ether'));
                setNextJackpotAmount(web3.utils.fromWei(nextJackpot, 'ether'));
                setPlayerGuesses(parseInt(player));
                setGuessCost(web3.utils.fromWei(cost, 'mwei'));
                setTokenBalance(web3.utils.fromWei(balance, 'mwei'));
                setSplits(split.map(val => Number(val)));
            } catch (error: unknown) {
                console.error("Fetch game stats error:", error);
                const errorMessage = error instanceof Error ? error.message : 'Check console.';
                setError(`Failed to fetch game stats: ${errorMessage}`);
            }
        }
    }, [jackpotContract, tokenContract, bondingContract, account, web3]);

    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                try {
                    const chainId = await web3Instance.eth.getChainId();
                    if (chainId.toString() !== SONIC_TESTNET_CHAIN_ID) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: `0x${parseInt(SONIC_TESTNET_CHAIN_ID).toString(16)}` }],
                            });
                        } catch (switchError: unknown) {
                            const isMetaMaskError = switchError && typeof switchError === 'object' && 'code' in switchError;
                            if (isMetaMaskError && (switchError as MetaMaskError).code === 4902) {
                                await window.ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [{
                                        chainId: `0x${parseInt(SONIC_TESTNET_CHAIN_ID).toString(16)}`,
                                        chainName: 'Sonic Testnet',
                                        rpcUrls: [SONIC_TESTNET_RPC_URL],
                                        nativeCurrency: {
                                            name: 'Sonic',
                                            symbol: 'S',
                                            decimals: 18,
                                        },
                                        blockExplorerUrls: ['https://testnet.soniclabs.com'],
                                    }],
                                });
                            } else {
                                throw switchError;
                            }
                        }
                    }
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);
                    setWeb3(web3Instance);

                    const jackpotGame = new web3Instance.eth.Contract(jackpotGameABI, JACKPOT_ADDRESS);
                    const token100X = new web3Instance.eth.Contract(token100xABI, TOKEN_ADDRESS);
                    const bondingCurve = new web3Instance.eth.Contract(bondingCurveABI, BONDING_CURVE_ADDRESS);

                    setJackpotContract(jackpotGame);
                    setTokenContract(token100X);
                    setBondingContract(bondingCurve);

                    await fetchGameStats();
                } catch (error: unknown) {
                    console.error("Web3 initialization error:", error);
                    const errorMessage = error instanceof Error ? error.message : 'Check console.';
                    setError(`Failed to connect or load data: ${errorMessage}`);
                }
            } else {
                setError("Please install MetaMask or Rabby to connect.");
            }
        };
        initWeb3();
    }, [fetchGameStats]);

    const connectWallet = async () => {
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            try {
                const chainId = await web3Instance.eth.getChainId();
                if (chainId.toString() !== SONIC_TESTNET_CHAIN_ID) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: `0x${parseInt(SONIC_TESTNET_CHAIN_ID).toString(16)}` }],
                        });
                    } catch (switchError: unknown) {
                        const isMetaMaskError = switchError && typeof switchError === 'object' && 'code' in switchError;
                        if (isMetaMaskError && (switchError as MetaMaskError).code === 4902) {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: `0x${parseInt(SONIC_TESTNET_CHAIN_ID).toString(16)}`,
                                    chainName: 'Sonic Testnet',
                                    rpcUrls: [SONIC_TESTNET_RPC_URL],
                                    nativeCurrency: {
                                        name: 'Sonic',
                                        symbol: 'S',
                                        decimals: 18,
                                    },
                                    blockExplorerUrls: ['https://testnet.soniclabs.com'],
                                }],
                            });
                        } else {
                            throw switchError;
                        }
                    }
                }
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0]);
                setWeb3(web3Instance);
                setError(null);
            } catch (error: unknown) {
                console.error("Wallet connection error:", error);
                const errorMessage = error instanceof Error ? error.message : 'Check console.';
                setError(`Failed to connect wallet: ${errorMessage}`);
            }
        } else {
            setError("Please install MetaMask or Rabby to connect.");
        }
    };

    const buy100X = async () => {
        if (!web3 || !account || !buyAmount || !bondingContract) {
            setError("Wallet not connected, invalid amount, or contract not initialized.");
            return;
        }
        try {
            const token100X = new web3.eth.Contract(token100xABI, TOKEN_ADDRESS);
            const amount = web3.utils.toWei(buyAmount, 'mwei');
            const initialPriceCall = await bondingContract.methods.initialPrice().call();
            if (!initialPriceCall || typeof initialPriceCall !== 'string') {
                throw new Error("Failed to fetch initial price");
            }
            const initialPrice = BigInt(initialPriceCall);
            const priceIncreaseCall = await bondingContract.methods.priceIncrease().call();
            if (!priceIncreaseCall || typeof priceIncreaseCall !== 'string') {
                throw new Error("Failed to fetch price increase");
            }
            const priceIncrease = BigInt(priceIncreaseCall);
            const totalBoughtCall = await bondingContract.methods.totalBought().call();
            if (!totalBoughtCall || typeof totalBoughtCall !== 'string') {
                throw new Error("Failed to fetch total bought");
            }
            const totalBought = BigInt(totalBoughtCall);
            const tokenBalanceCall = await token100X.methods.balanceOf(BONDING_CURVE_ADDRESS).call();
            if (!tokenBalanceCall || typeof tokenBalanceCall !== 'string') {
                throw new Error("Failed to fetch token balance from BondingCurve");
            }
            const tokenBalance = BigInt(tokenBalanceCall);

            const startPrice = initialPrice + (totalBought / BigInt(10**6)) * priceIncrease;
            const endPrice = startPrice + (BigInt(amount) / BigInt(10**6)) * priceIncrease;
            const totalCost = (startPrice + endPrice) * (BigInt(amount) / BigInt(10**6)) / (2n * 10n**18n);
            const costInWei = totalCost.toString();

            const walletBalanceCall = await web3.eth.getBalance(account);
            if (!walletBalanceCall || typeof walletBalanceCall !== 'string') {
                throw new Error("Failed to fetch wallet balance");
            }
            const walletBalance = BigInt(walletBalanceCall);
            if (walletBalance < BigInt(costInWei)) {
                throw new Error(`Insufficient S: Need ${web3.utils.fromWei(costInWei, 'ether')} S`);
            }
            if (tokenBalance < BigInt(amount)) {
                throw new Error(`BondingCurve has insufficient 100X: Need ${web3.utils.fromWei(amount, 'mwei')}`);
            }

            await bondingContract.methods.buy(amount).send({ from: account, value: costInWei });
            setError(`Bought ${buyAmount} 100X!`);
            setBuyAmount('');
            await fetchGameStats();
        } catch (error: unknown) {
            console.error("Buy 100X error:", error);
            const errorMessage = error instanceof Error ? error.message : 'Check console.';
            setError(`Failed to buy 100X: ${errorMessage}`);
        }
    };

    const sell100X = async () => {
        if (!web3 || !account || !sellAmount || !bondingContract || !tokenContract) {
            setError("Wallet not connected, invalid amount, or contracts not initialized.");
            return;
        }
        try {
            const amount = web3.utils.toWei(sellAmount, 'mwei');
            const userBalanceCall = await tokenContract.methods.balanceOf(account).call();
            if (!userBalanceCall || typeof userBalanceCall !== 'string') {
                throw new Error("Failed to fetch user balance");
            }
            const userBalance = BigInt(userBalanceCall);
            const currentAllowanceCall = await tokenContract.methods.allowance(account, BONDING_CURVE_ADDRESS).call();
            if (!currentAllowanceCall || typeof currentAllowanceCall !== 'string') {
                throw new Error("Failed to fetch allowance");
            }
            const currentAllowance = BigInt(currentAllowanceCall);

            if (userBalance < BigInt(amount)) {
                throw new Error(`Insufficient 100X balance: Need ${sellAmount}`);
            }

            if (currentAllowance > 0n) {
                await tokenContract.methods.approve(BONDING_CURVE_ADDRESS, 0).send({ from: account });
            }

            await tokenContract.methods.approve(BONDING_CURVE_ADDRESS, amount).send({ from: account });
            await bondingContract.methods.sell(amount).send({ from: account });
            setError(`Sold ${sellAmount} 100X!`);
            setSellAmount('');
            await fetchGameStats();
        } catch (error: unknown) {
            console.error("Sell 100X error:", error);
            const errorMessage = error instanceof Error ? error.message : 'Check console.';
            setError(`Failed to sell 100X: ${errorMessage}`);
        }
    };

    const commitGuess = async () => {
        if (!web3 || !account || !guessInput || !jackpotContract || !tokenContract) {
            setError("Wallet not connected, no guess entered, or contracts not initialized.");
            return;
        }
        try {
            const isPaused = await jackpotContract.methods.paused().call() as boolean;
            if (isPaused) {
                throw new Error("Game is paused. Cannot submit guesses.");
            }

            const cost = await jackpotContract.methods.guessCost().call() as string;
            const userBalanceCall = await tokenContract.methods.balanceOf(account).call();
            if (!userBalanceCall || typeof userBalanceCall !== 'string') {
                throw new Error("Failed to fetch user balance");
            }
            const userBalance = BigInt(userBalanceCall);
            const currentAllowanceCall = await tokenContract.methods.allowance(account, JACKPOT_ADDRESS).call();
            if (!currentAllowanceCall || typeof currentAllowanceCall !== 'string') {
                throw new Error("Failed to fetch allowance");
            }
            const currentAllowance = BigInt(currentAllowanceCall);

            if (BigInt(userBalance) < BigInt(cost)) {
                throw new Error(`Insufficient 100X balance: Need ${web3.utils.fromWei(cost, 'mwei')} 100X`);
            }

            if (currentAllowance > 0n) {
                await tokenContract.methods.approve(JACKPOT_ADDRESS, 0).send({ from: account });
            }

            await tokenContract.methods.approve(JACKPOT_ADDRESS, cost).send({ from: account });

            const nonceValue = web3.utils.randomHex(32);
            const guessHash = web3.utils.sha3(guessInput + nonceValue);
            if (!guessHash) {
                throw new Error("Failed to generate guess hash");
            }
            setNonce(nonceValue);

            await jackpotContract.methods.commitGuess(guessHash).send({ from: account });
            setError("Guess submitted! Wait 20 seconds to reveal.");
            await fetchGameStats();
        } catch (error: unknown) {
            console.error("Commit guess error:", error);
            const errorMessage = error instanceof Error ? error.message : 'Check console.';
            setError(`Failed to submit guess: ${errorMessage}`);
        }
    };

    const revealGuess = async () => {
        if (!web3 || !account || !guessInput || !nonce || !jackpotContract) {
            setError("No guess or nonce available, or contract not initialized.");
            return;
        }
        try {
            const tx = await jackpotContract.methods.revealGuess(guessInput, nonce).send({ from: account });
            const won = tx.events?.GuessRevealed?.returnValues?.won === 'true';
            if (won) {
                await fetchGameStats();
                setError("You won! Payout processed. Check your wallet.");
            } else {
                const hintCountCall = await jackpotContract.methods.hintCount().call();
                if (!hintCountCall || typeof hintCountCall !== 'string') {
                    throw new Error("Failed to fetch hint count");
                }
                const hintCount = BigInt(hintCountCall).toString();
                const hintNum = parseInt(hintCount);
                setHint(hintNum > 0
                    ? `Wrong guess! Hint #${hintNum - 1} available. Request a hint below.`
                    : "Wrong guess! No hints available—check social media.");
            }
            setGuessInput('');
            setNonce('');
        } catch (error: unknown) {
            console.error("Reveal guess error:", error);
            const errorMessage = error instanceof Error ? error.message : 'Check console.';
            setError(`Failed to reveal guess: ${errorMessage}`);
        }
    };

    const requestHint = async () => {
        if (!web3 || !account || !jackpotContract || !tokenContract) {
            setError("Wallet not connected or contracts not initialized.");
            return;
        }
        try {
            const cost = await jackpotContract.methods.hintCost().call() as string;
            const userBalanceCall = await tokenContract.methods.balanceOf(account).call();
            if (!userBalanceCall || typeof userBalanceCall !== 'string') {
                throw new Error("Failed to fetch user balance");
            }
            const userBalance = BigInt(userBalanceCall);
            const currentAllowanceCall = await tokenContract.methods.allowance(account, JACKPOT_ADDRESS).call();
            if (!currentAllowanceCall || typeof currentAllowanceCall !== 'string') {
                throw new Error("Failed to fetch allowance");
            }
            const currentAllowance = BigInt(currentAllowanceCall);

            if (BigInt(userBalance) < BigInt(cost)) {
                throw new Error(`Insufficient 100X balance: Need ${web3.utils.fromWei(cost, 'mwei')} 100X`);
            }

            if (currentAllowance > 0n) {
                await tokenContract.methods.approve(JACKPOT_ADDRESS, 0).send({ from: account });
            }

            await tokenContract.methods.approve(JACKPOT_ADDRESS, cost).send({ from: account });

            jackpotContract.events.HintRequested({ filter: { player: account } })
                .on('data', async (event: HintRequestedEvent) => {
                    const hintIndex = event.returnValues.hintIndex as string;
                    try {
                        const response = await fetch(`${HINT_API_URL}?index=${hintIndex}&player=${account}`);
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        const hintData: HintData = await response.json();
                        setHint(`Hint #${hintIndex}: ${hintData.hint}`);
                        setError("Hint retrieved!");
                    } catch (fetchError: unknown) {
                        console.error("Hint fetch error:", fetchError);
                        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Check console.';
                        setError(`Failed to fetch hint #${hintIndex}: ${errorMessage}`);
                    }
                })
                .on('error', (error: Error) => {
                    console.error("Event error:", error);
                    const errorMessage = error instanceof Error ? error.message : 'Check console.';
                    setError(`Failed to receive hint event: ${errorMessage}`);
                });

            await jackpotContract.methods.requestHint().send({ from: account });
            setError("Hint requested! Waiting for hint...");
            await fetchGameStats();
        } catch (error: unknown) {
            console.error("Request hint error:", error);
            const errorMessage = error instanceof Error ? error.message : 'Check console.';
            setError(`Failed to request hint: ${errorMessage}`);
        }
    };

    return (
        <div className="App">
            <h1>100X Jackpot</h1>
            <p>Uncover the Secret with 100X!</p>
            <div>
                <p>Total Guesses: {totalGuesses}</p>
                <p>Current Jackpot: {jackpotAmount} S (90% to winner)</p>
                <p>Next Jackpot Pool: {nextJackpotAmount} S (90% rolls over to new jackpot, 10% remains on win)</p>
                <p>Guess Cost: {guessCost} 100X</p>
                <p>Splits: Burn {splits[0]}%, Jackpot {splits[1]}%, Next {splits[2]}%, Marketing {splits[3]}%</p>
                {account && <p>Your 100X Balance: {tokenBalance}</p>}
                {account && <p>Your Guesses: {playerGuesses}</p>}
                {!account ? (
                    <button
                        style={{ ...buttonStyle, backgroundColor: '#00d4ff', color: '#1a1a2e' }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#00e4ff')}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#00d4ff')}
                        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(0.95)')}
                        onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(1)')}
                        onClick={connectWallet}
                    >
                        Connect MetaMask/Rabby
                    </button>
                ) : (
                    <p>Connected: {account.slice(0, 6)}...</p>
                )}
                {error && <p style={{ color: '#e94560' }}>{error}</p>}
                {hint && <p style={{ color: '#00ffff' }}>{hint}</p>}
            </div>
            {account && (
                <div>
                    <div>
                        <input
                            type="number"
                            placeholder="Amount to buy"
                            style={{ margin: '5px', padding: '5px' }}
                            value={buyAmount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuyAmount(e.target.value)}
                        />
                        <button
                            style={{ ...buttonStyle, backgroundColor: '#00ff00', color: '#1a1a2e' }}
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#00ff33')}
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#00ff00')}
                            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(0.95)')}
                            onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(1)')}
                            onClick={buy100X}
                        >
                            Buy 100X
                        </button>
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder="Amount to sell"
                            style={{ margin: '5px', padding: '5px' }}
                            value={sellAmount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSellAmount(e.target.value)}
                        />
                        <button
                            style={{ ...buttonStyle, backgroundColor: '#ff0000', color: '#fff' }}
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#ff3333')}
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#ff0000')}
                            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(0.95)')}
                            onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(1)')}
                            onClick={sell100X}
                        >
                            Sell 100X
                        </button>
                    </div>
                    <button
                        style={{ ...buttonStyle, backgroundColor: '#e94560', color: '#fff' }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#f95570')}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#e94560')}
                        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(0.95)')}
                        onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(1)')}
                        onClick={commitGuess}
                    >
                        Guess ({guessCost} 100X)
                    </button>
                    <button
                        style={{ ...buttonStyle, backgroundColor: '#00ffff', color: '#1a1a2e' }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#00ffcc')}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#00ffff')}
                        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(0.95)')}
                        onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(1)')}
                        onClick={requestHint}
                    >
                        Hint
                    </button>
                    <input
                        type="text"
                        placeholder="Enter your guess"
                        style={{ margin: '5px', padding: '5px', width: '200px' }}
                        value={guessInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuessInput(e.target.value)}
                    />
                    <button
                        style={{ ...buttonStyle, backgroundColor: '#ffd700', color: '#1a1a2e' }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#ffeb3b')}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#ffd700')}
                        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(0.95)')}
                        onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(1)')}
                        onClick={revealGuess}
                    >
                        Reveal Guess
                    </button>
                </div>
            )}
            <footer style={{ textAlign: 'center', marginTop: '20px', color: '#00d4ff' }}>
                <a href="https://twitter.com" style={{ margin: '0 10px', color: '#00d4ff' }}>Twitter</a> |
                <a href="/terms" style={{ margin: '0 10px', color: '#00d4ff' }}>Terms</a>
            </footer>
        </div>
    );
};

export default App;