import { AccountInfo, DAppClient } from '@airgap/beacon-sdk';
import { DekuToolkit, fromBeaconSigner } from '@marigold-dev/deku-toolkit';
import { useEffect, useState } from 'react';
import './App.css';
import ConnectButton from './ConnectWallet';
import DisconnectButton from './DisconnectWallet';

function App() {

  const [dAppClient, setdAppClient] = useState<DAppClient>();
  const [userAddress, setUserAddress] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);
  const [userAddress2, setUserAddress2] = useState<string>("");
  const [activeAccount, setActiveAccount] = useState<AccountInfo>();
  const [dekuClient, setDekuClient] = useState<DekuToolkit>();

  const ticketer: string = process.env["REACT_APP_CONTRACT"]!;
  const ticketBytes: string = "050505030b";

  useEffect(() => {
    (async () => {
      setdAppClient(new DAppClient({ name: "Test" }));

      const dekuClient = new DekuToolkit({
        dekuRpc: process.env["REACT_APP_DEKU_NODE"]!, dekuSigner: fromBeaconSigner(dAppClient!)
      })
        .setTezosRpc(process.env["REACT_APP_TEZOS_NODE"]!)
        .onBlock(block => {
          console.log("The client received a block");
          console.log(block);
        })
      setDekuClient(dekuClient);

      setUserAddress2("tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6");
      console.log("call once", dekuClient);
    })();
  }, []
  );

  useEffect(() => {
    (async () => {
      if (dekuClient) {
        setUserBalance(await dekuClient!.getBalance(userAddress, { ticketer: ticketer, data: ticketBytes }));
        const intervalId = setInterval(() => { dekuClient!.getBalance(userAddress, { ticketer: ticketer, data: ticketBytes }); console.log("Balance refreshed"); }, 15 * 1000);
        return () => { clearInterval(intervalId); };
      }
    })();

  }, [userAddress]
  );

  const handleL2Transfer = async () => {
    try {
      const opHash = await dekuClient!.transferTo(userAddress2, 1, ticketer, ticketBytes);
    } catch (error: any) {
      console.log(`Error: `, error);
    } finally {
    }
  };

  return (
    <div className="App">
      <header className="App-header">


        <hr />
        <h1>USER1</h1>

        {!userAddress ?
          <ConnectButton
            Tezos={dAppClient!}
            setUserAddress={setUserAddress}
          />
          :
          <DisconnectButton
            Tezos={dAppClient!}
            userAddress={userAddress}
            setUserAddress={setUserAddress}
          />}

        <div>
          I am {userAddress} with {userBalance} XTZ tickets
        </div>

        <br />
        <div>
          Enter L2 address here :
          <input value={userAddress2} onChange={(e) => setUserAddress2(e.currentTarget.value)}></input>
          <button onClick={handleL2Transfer}>Send money</button>
        </div>
      </header>
    </div>
  );
}

export default App;