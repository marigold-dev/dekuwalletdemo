import { BeaconMessageType, BlockchainRequestV3, BlockchainResponseV3, DAppClient, DekuBlockchain, DekuMessageType, DekuPermissionScope, DekuTransferRequest } from '@airgap/beacon-sdk';
import { DekuToolkit, fromBeaconSigner } from '@marigold-dev/deku-toolkit';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import ConnectButton from './ConnectWallet';
import DisconnectButton from './DisconnectWallet';

function App() {

  const [dAppClient, setdAppClient] = useState<DAppClient>();
  const [userAddress, setUserAddress] = useState<string>("");
  let oldUserAddress = useRef<string>();

  const [userBalance, setUserBalance] = useState<number>(0);
  const [userAddress2, setUserAddress2] = useState<string>("");
  const [dekuClient, setDekuClient] = useState<DekuToolkit>();

  const ticketer: string = process.env["REACT_APP_CONTRACT"]!;
  const ticketBytes: string = "050505030b";

  useEffect(() => {
    (async () => {

      let client: DAppClient = new DAppClient({ name: "Test" });
      const dekuBlockchain = new DekuBlockchain();
      client.addBlockchain(dekuBlockchain);
      setdAppClient(client);


      const dekuClient = new DekuToolkit({
        dekuRpc: process.env["REACT_APP_DEKU_NODE"]!, dekuSigner: fromBeaconSigner(dAppClient!)
      })
        .setTezosRpc(process.env["REACT_APP_TEZOS_NODE"]!)
        .onBlock(block => {
          console.log("The client received a block");
          console.log(block);
        });

      setDekuClient(dekuClient);

      setUserAddress2("tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6");
      console.log("call once", dekuClient);
    })();
  }, []
  );

  useEffect(() => {
    (async () => {
      if (dekuClient) {
        if (userAddress) {
          setUserBalance(await dekuClient!.getBalance(userAddress, { ticketer: ticketer, data: ticketBytes }));
          oldUserAddress.current = userAddress; //keep ref
          const intervalId = setInterval(async () => {
            try {
              if (oldUserAddress.current) setUserBalance(await dekuClient!.getBalance(oldUserAddress.current, { ticketer: ticketer, data: ticketBytes }));
              console.log("Balance refreshed on " + oldUserAddress.current);
            } catch (err) {
              console.log(err);
            }
          }, 15 * 1000);
          return () => { clearInterval(intervalId); };

        } else {
          oldUserAddress.current = undefined;
        }

      }
    })();

  }, [userAddress]
  );

  const handleL2Transfer = async () => {
    try {

      let request: DekuTransferRequest = {
        blockchainIdentifier: "deku",
        type: BeaconMessageType.BlockchainRequest,
        blockchainData: {
          type: DekuMessageType.transfer_request,
          scope: DekuPermissionScope.transfer,
          amount: "1",
          mode: 'submit',
          recipient: userAddress2,
          sourceAddress: userAddress,
          ticketer: ticketer,
          data: ticketBytes,
          options: {}
        }
      };

      const br: BlockchainResponseV3<string> | undefined = await dAppClient?.request({ ...request, accountId: (await dAppClient.getActiveAccount())!.accountIdentifier } as BlockchainRequestV3<"deku">);
      console.log("BlockchainResponseV3", br);
      // const opHash = await dekuClient!.transferTo(userAddress2, 1, ticketer, ticketBytes);
    } catch (error: any) {
      console.log(`Error: `, error);
    } finally {
    }
  };

  return (
    <div className="App">
      <header className="App-header">

        <h1>DEKU DEMO</h1>
        <h2>Sign tx with Temple/BeaconSDK v3 messages</h2>

        <hr style={{ width: "100%" }} />

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
            setUserBalance={setUserBalance}
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