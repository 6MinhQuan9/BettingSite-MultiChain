import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useWalletAddress } from 'gamba-react-v2'
import { GambaUi } from 'gamba-react-ui-v2'
import React, { useState } from 'react'
import { Modal } from '../components/Modal'
import { truncateString } from '../utils'
import { ethers } from "ethers";

function ConnectedButton() {
  const [modal, setModal] = React.useState(false)
  const wallet = useWallet()
  const ref = React.useRef<HTMLDivElement>(null!)
  const address = useWalletAddress()

  return (
    <>
      {modal && (
        <Modal onClose={() => setModal(false)}>
          <h1>
            {truncateString(address.toBase58(), 6, 3)}
          </h1>
          <GambaUi.Button onClick={() => wallet.disconnect()}>
            Disconnect
          </GambaUi.Button>
        </Modal>
      )}
      <div style={{ position: 'relative' }} ref={ref}>
        <GambaUi.Button
          onClick={() => setModal(true)}
        >
          <div style={{ display: 'flex', gap: '.5em', alignItems: 'center' }}>
            <img src={wallet.wallet?.adapter.icon} height="20px" />
            {truncateString(address.toBase58(), 3)}
          </div>
        </GambaUi.Button>
      </div>
    </>
  )
}

export function UserButton() {
  const walletModal = useWalletModal()
  const wallet = useWallet()

  const connect = () => {
    if (wallet.wallet) {
      wallet.connect()
    } else {
      walletModal.setVisible(true)
    }
  }

  const [data, setdata] = useState<any>({
    address: "",
    Balance: null,
  });

  const [account, setAccount] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  // Button handler button for handling a
  // request event for metamask
  const btnhandler = () => {
    // Asking if metamask is already present or not
    if (window.ethereum) {
      // res[0] for fetching a first wallet
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res: any) =>
          accountChangeHandler(res[0])
        );
    } else {
      alert("install metamask extension!!");
    }
  };

  // getbalance function for getting a balance in
  // a right format with help of ethers
  const getbalance = (address: any) => {
    // Requesting balance method
    window.ethereum
      .request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      .then((balance: any) => {
        // Setting balance
        setdata({
          Balance:
            ethers.utils.formatEther(balance),
        });
      });
  };

  // Function for getting handling all events
  const accountChangeHandler = (account: any) => {
    // Setting an address data
    setdata({
      address: account,
    });

    // Setting a balance
    getbalance(account);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setWalletConnected(true);
        console.log('Trust Wallet connected:', accounts[0]);
      } catch (error) {
        console.error('User rejected the request:', error);
      }
    } else {
      alert('Trust Wallet not found. Please install it or open this site in the Trust Wallet browser.');
    }
  };

  return (
    <>
      {wallet.connected ? <ConnectedButton /> : (
        <GambaUi.Button onClick={connect}>
          {wallet.connecting ? 'Connecting' : 'Connect'}
        </GambaUi.Button>
      )}

      {!walletConnected && (
        <div>
          {data.address ? (
            <div>
              <h2>Wallet Connected</h2>
              <p>Account: {data.address}</p>
            </div>
          ) : (
            <button onClick={btnhandler}>Connect to metamask wallet</button>
          )}
        </div>
      )}


      {!data.address && (
        <div>
          {walletConnected ? (
            <div>
              <h2>Wallet Connected</h2>
              <p>Account: {account}</p>
            </div>
          ) : (
            <button onClick={connectWallet}>Connect Trust Wallet</button>
          )}
        </div>
      )}

    </>
  )
}
