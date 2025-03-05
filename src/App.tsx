import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

// Full GameToken ABI
const gameTokenABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "allowance", "type": "uint256"},
      {"internalType": "uint256", "name": "needed", "type": "uint256"}
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "sender", "type": "address"},
      {"internalType": "uint256", "name": "balance", "type": "uint256"},
      {"internalType": "uint256", "name": "needed", "type": "uint256"}
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "approver", "type": "address"}
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "receiver", "type": "address"}
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "sender", "type": "address"}
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "spender", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {"internalType": "uint8", "name": "", "type": "uint8"}
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Full BondingCurve ABI
const bondingABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_gameToken", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "gameAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "sPaid", "type": "uint256"}
    ],
    "name": "Buy",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "GameTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "seller", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "gameAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "sReceived", "type": "uint256"}
    ],
    "name": "Sell",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "toPool", "type": "address"}
    ],
    "name": "Transition",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "INITIAL_PRICE",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PRICE_INCREASE",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "THRESHOLD",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ammAddress",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "balances",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "gameAmount", "type": "uint256"}
    ],
    "name": "buy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gameToken",
    "outputs": [
      {"internalType": "contract IERC20", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPoolS",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolS",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "gameAmount", "type": "uint256"}
    ],
    "name": "sell",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_ammAddress", "type": "address"}
    ],
    "name": "setAMMAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSold",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transferGameToPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Full JackpotGame ABI
const jackpotGameABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_gameToken", "type": "address"},
      {"internalType": "address", "name": "_bondingCurve", "type": "address"},
      {"internalType": "address", "name": "_marketingWallet", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "newGuessCost", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "newHintCost", "type": "uint256"}
    ],
    "name": "CostsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "won", "type": "bool"}
    ],
    "name": "GuessSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "HintPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "newWallet", "type": "address"}
    ],
    "name": "MarketingWalletUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "burn", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "jackpot", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "next", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "marketing", "type": "uint256"}
    ],
    "name": "SplitUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "bondingCurve",
    "outputs": [{"internalType": "contract IBondingCurve", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "burnPercent",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buyHint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gameToken",
    "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSplit",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "guessCost",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hintCost",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "jackpotAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "jackpotPercent",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketingPercent",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketingWallet",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextJackpotAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextJackpotPercent",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
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
    "inputs": [
      {"internalType": "uint256", "name": "_guessCost", "type": "uint256"},
      {"internalType": "uint256", "name": "_hintCost", "type": "uint256"}
    ],
    "name": "setCosts",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_newWallet", "type": "address"}],
    "name": "setMarketingWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "submitGuess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalGuesses",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_burn", "type": "uint256"},
      {"internalType": "uint256", "name": "_jackpot", "type": "uint256"},
      {"internalType": "uint256", "name": "_next", "type": "uint256"},
      {"internalType": "uint256", "name": "_marketing", "type": "uint256"}
    ],
    "name": "updateSplit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
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

const App: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [jackpotAmount, setJackpotAmount] = useState<number>(150);
  const [nextJackpotAmount, setNextJackpotAmount] = useState<number>(0);
  const [totalGuesses, setTotalGuesses] = useState<number>(0);

  const bondingAddress = "0x6DFd5526be721a6eC6AAD72769ed0ACB1bb35C38";
  const gameAddress = "0x4C2e61156Ccd76d2dC351720f3759325b2DC0d27";
  const jackpotGameAddress = "0x09984E712cA4a1F5bD64566b1358725c90014E15"; // Deployed address

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          setWeb3(web3Instance);

          const jackpotGame = new web3Instance.eth.Contract(jackpotGameABI, jackpotGameAddress);
          const jackpot = (await jackpotGame.methods.jackpotAmount().call()) as unknown as string;
          const next = (await jackpotGame.methods.nextJackpotAmount().call()) as unknown as string;
          const guesses = (await jackpotGame.methods.totalGuesses().call()) as unknown as string;
          setJackpotAmount(parseFloat(web3Instance.utils.fromWei(jackpot || '0', 'ether')));
          setNextJackpotAmount(parseFloat(web3Instance.utils.fromWei(next || '0', 'ether')));
          setTotalGuesses(Number(guesses || '0'));
        } catch (error) {
          console.error("Failed to initialize Web3 or fetch contract data:", error);
        }
      }
    };
    initWeb3();
  }, []);

  const connectWallet = async (wallet: string) => {
    if (wallet === 'metamask' && window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);
      setWeb3(web3Instance);
    } else if (wallet === 'rabby' && window.rabby) {
      const rabby = new Web3(window.rabby);
      const accounts = await rabby.eth.getAccounts();
      setAccount(accounts[0]);
      setWeb3(rabby);
    }
  };

  const buyGame = async (amount: number) => {
    if (web3 && account) {
      const bonding = new web3.eth.Contract(bondingABI, bondingAddress);
      const price = (await bonding.methods.INITIAL_PRICE().call()) as unknown as string;
      const cost = web3.utils.toWei((amount * Number(price) / 10**18).toString(), 'ether');
      await bonding.methods.buy(web3.utils.toWei(amount.toString(), 'mwei')).send({ from: account, value: cost });
      alert(`Bought ${amount} GAME`);
    }
  };

  const makeGuess = async () => {
    if (web3 && account) {
      const game = new web3.eth.Contract(gameTokenABI, gameAddress);
      const jackpotGame = new web3.eth.Contract(jackpotGameABI, jackpotGameAddress);
      const cost = (await jackpotGame.methods.guessCost().call()) as unknown as string;
      await game.methods.approve(jackpotGameAddress, cost).send({ from: account });
      await jackpotGame.methods.submitGuess().send({ from: account });
      const jackpot = (await jackpotGame.methods.jackpotAmount().call()) as unknown as string;
      const next = (await jackpotGame.methods.nextJackpotAmount().call()) as unknown as string;
      const guesses = (await jackpotGame.methods.totalGuesses().call()) as unknown as string;
      setJackpotAmount(parseFloat(web3.utils.fromWei(jackpot || '0', 'ether')));
      setNextJackpotAmount(parseFloat(web3.utils.fromWei(next || '0', 'ether')));
      setTotalGuesses(Number(guesses || '0'));
      alert("Guess submitted!");
    }
  };

  const payForHint = async () => {
    if (web3 && account) {
      const game = new web3.eth.Contract(gameTokenABI, gameAddress);
      const jackpotGame = new web3.eth.Contract(jackpotGameABI, jackpotGameAddress);
      const cost = (await jackpotGame.methods.hintCost().call()) as unknown as string;
      await game.methods.approve(jackpotGameAddress, cost).send({ from: account });
      await jackpotGame.methods.buyHint().send({ from: account });
      alert("Hint purchased!");
    }
  };

  return (
    <div className="App" style={{ backgroundColor: '#1a1a2e', color: '#00d4ff', padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', color: '#e94560' }}>What’s the CA? Jackpot</h1>
      <p style={{ textAlign: 'center', color: '#00d4ff' }}>Uncover the Crypto Action with GAME!</p>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p>Jackpot: {jackpotAmount} S</p>
        <p>Next Jackpot: {nextJackpotAmount} S</p>
        {!account ? (
          <>
            <button onClick={() => connectWallet('metamask')} style={{ margin: '5px', padding: '10px', backgroundColor: '#00d4ff', color: '#1a1a2e', border: 'none', borderRadius: '5px' }}>
              Connect MetaMask
            </button>
            <button onClick={() => connectWallet('rabby')} style={{ margin: '5px', padding: '10px', backgroundColor: '#00d4ff', color: '#1a1a2e', border: 'none', borderRadius: '5px' }}>
              Connect Rabby
            </button>
          </>
        ) : (
          <p>Connected: {account}</p>
        )}
      </div>
      {account && (
        <div style={{ textAlign: 'center' }}>
          <div>
            <input type="number" placeholder="Amount of GAME" style={{ margin: '5px', padding: '5px' }} />
            <button onClick={() => buyGame(10000)} style={{ margin: '5px', padding: '10px', backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '5px' }}>
              Buy GAME
            </button>
          </div>
          <button onClick={makeGuess} style={{ margin: '5px', padding: '10px', backgroundColor: '#00ff00', color: '#1a1a2e', border: 'none', borderRadius: '5px' }}>
            Guess (10,000 GAME)
          </button>
          <button onClick={payForHint} style={{ margin: '5px', padding: '10px', backgroundColor: '#ff00ff', color: '#fff', border: 'none', borderRadius: '5px' }}>
            Pay for Hint (5,000 GAME)
          </button>
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Recent Wins: 0 | Total Guesses: {totalGuesses}</p>
      </div>
      <footer style={{ textAlign: 'center', marginTop: '20px', color: '#00d4ff' }}>
        <a href="https://twitter.com" style={{ margin: '0 10px', color: '#00d4ff' }}>Twitter</a> |
        <a href="https://discord.com" style={{ margin: '0 10px', color: '#00d4ff' }}>Discord</a> |
        <a href="/terms" style={{ margin: '0 10px', color: '#00d4ff' }}>Terms</a> |
        <a href="/contact" style={{ margin: '0 10px', color: '#00d4ff' }}>Contact</a>
      </footer>
    </div>
  );
};

export default App;