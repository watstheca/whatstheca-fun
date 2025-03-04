import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

const App: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [jackpotAmount, setJackpotAmount] = useState<number>(150); // Used in JSX
  const bondingAddress = "0x6DFd5526be721a6eC6AAD72769ed0ACB1bb35C38"; // To be used with ABI
  const gameAddress = "0x4C2e61156Ccd76d2dC351720f3759325b2DC0d27"; // To be used with ABI

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          setWeb3(web3Instance);
        } catch (error) {
          console.error("Wallet connection failed:", error);
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
      console.log(`Buying ${amount} GAME with ${account} via ${bondingAddress}`);
    }
  };

  const makeGuess = async () => {
    if (web3 && account) {
      console.log(`Guess made with ${account} for 10,000 GAME via ${gameAddress}`);
    }
  };

  const payForHint = async () => {
    if (web3 && account) {
      console.log(`Paid for hint with ${account} for 5,000 GAME via ${gameAddress}`);
    }
  };

  return (
    <div className="App" style={{ backgroundColor: '#1a1a2e', color: '#00d4ff', padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', color: '#e94560' }}>What’s the CA? Jackpot</h1>
      <p style={{ textAlign: 'center', color: '#00d4ff' }}>Uncover the Crypto Action with GAME!</p>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p>Jackpot: {jackpotAmount} S</p>
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
        <p>Recent Wins: 0 | Total Guesses: 0 | GAME in Circulation: 0</p>
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