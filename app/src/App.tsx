import {
  DekuBlockchain,
  DekuMessageType,
  DekuPermissionScope,
  DekuTransferRequest,
} from "@airgap/beacon-blockchain-deku";
import {
  BeaconMessageType,
  BlockchainRequestV3,
  BlockchainResponseV3,
  DAppClient,
} from "@airgap/beacon-sdk";
import { DekuPClient, fromBeaconSigner } from "@marigold-dev/deku";
import { PackDataParams, PackDataResponse } from "@taquito/rpc";
import { MichelCodecPacker } from "@taquito/taquito";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import ConnectButton from "./ConnectWallet";
import DisconnectButton from "./DisconnectWallet";

function App() {
  const [dAppClient, setdAppClient] = useState<DAppClient>();
  const [userAddress, setUserAddress] = useState<string>("");
  let oldUserAddress = useRef<string>();

  const [userBalance, setUserBalance] = useState<number>(0);
  const [userAddress2, setUserAddress2] = useState<string>("");
  const [dekuClient, setDekuClient] = useState<DekuPClient>();
  const [ticketBytes, setTicketBytes] = useState<string>("");

  const ticketer: string = process.env["REACT_APP_CONTRACT"]!;

  async function getFABytes(contractAddress: string): Promise<string> {
    const p = new MichelCodecPacker();
    let addrBytes: PackDataResponse = await p.packData({
      data: { string: contractAddress }, // process.env["REACT_APP_CTEZ_CONTRACT"]!},
      type: { prim: "address" },
    });

    //why to remove first 12 chars ? no idea but it is like this ...
    //console.log("addrBytes",addrBytes.packed.substring(12));

    let FAbytes: PackDataParams = {
      data: {
        prim: "Right",
        args: [{ bytes: addrBytes.packed.substring(12) }],
      }, //'01f37d4eddfff4e08fb1f19895ac9c83bc12d2b36800'}]},
      type: {
        prim: "Or",
        args: [
          { prim: "Unit", annots: ["%XTZ"] },
          { prim: "address", annots: ["%FA"] },
        ],
      },
    };
    return (await p.packData(FAbytes)).packed;
  }

  useEffect(() => {
    (async () => {
      setTicketBytes(await getFABytes(process.env["REACT_APP_CTEZ_CONTRACT"]!));

      let client: DAppClient = new DAppClient({ name: "Test" });
      const dekuBlockchain = new DekuBlockchain();
      client.addBlockchain(dekuBlockchain);
      setdAppClient(client);

      const dekuSigner = fromBeaconSigner(dAppClient!);
      console.log("dekuSigner", dekuSigner);

      const dekuClient = new DekuPClient({
        dekuRpc: process.env["REACT_APP_DEKU_NODE"]!,
        dekuSigner,
      }).setTezosRpc(process.env["REACT_APP_TEZOS_NODE"]!);
      setDekuClient(dekuClient!);

      setUserAddress2("tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6");
      console.log("call once", dekuClient);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (dekuClient) {
        if (userAddress) {
          setUserBalance(
            await dekuClient!.getBalance(userAddress, {
              ticketer: ticketer,
              data: ticketBytes,
            })
          );
          oldUserAddress.current = userAddress; //keep ref
          const intervalId = setInterval(async () => {
            try {
              if (oldUserAddress.current)
                setUserBalance(
                  await dekuClient!.getBalance(oldUserAddress.current, {
                    ticketer: ticketer,
                    data: ticketBytes,
                  })
                );
              console.log("Balance refreshed on " + oldUserAddress.current);
            } catch (err) {
              console.log(err);
            }
          }, 15 * 1000);
          return () => {
            clearInterval(intervalId);
          };
        } else {
          oldUserAddress.current = undefined;
        }
      }
    })();
  }, [userAddress]);

  const handleL2Transfer = async () => {
    try {
      let request: DekuTransferRequest = {
        blockchainIdentifier: "deku",
        type: BeaconMessageType.BlockchainRequest,
        blockchainData: {
          type: DekuMessageType.transfer_request,
          scope: DekuPermissionScope.transfer,
          amount: "1",
          mode: "submit",
          recipient: userAddress2,
          sourceAddress: userAddress,
          ticketer: ticketer,
          data: ticketBytes,
          options: {},
        },
      };

      const br: BlockchainResponseV3<string> | undefined =
        await dAppClient?.request({
          ...request,
          accountId: (await dAppClient.getActiveAccount())!.accountIdentifier,
        } as BlockchainRequestV3<"deku">);
      console.log("BlockchainResponseV3", br);
    } catch (error: any) {
      console.log(`Error: `, error);
    } finally {
    }
  };

  const handleL2Sign = async () => {
    try {
      const activeAccount = await dAppClient?.getActiveAccount();
      console.log("activeAccount", activeAccount);
      const dekuSigner = fromBeaconSigner(dAppClient!);
      dekuClient?.setDekuSigner(dekuSigner);

      const opHash = await dekuClient!.transferTo(
        userAddress2,
        1,
        ticketer,
        ticketBytes
      );

      /*
      let request: DekuSignPayloadRequest = {
        blockchainIdentifier: "deku",
        type: BeaconMessageType.BlockchainRequest,
        blockchainData: {
          type: DekuMessageType.sign_payload_request,
          scope: DekuPermissionScope.sign_payload_json,
          payload: "{...}",
          mode: "submit",
        },
      };

      const br: BlockchainResponseV3<string> | undefined =
        await dAppClient?.request({
          ...request,
          accountId: (await dAppClient.getActiveAccount())!.accountIdentifier,
        } as BlockchainRequestV3<"deku">);*/
      console.log("opHash", opHash);
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

        {!userAddress ? (
          <ConnectButton Tezos={dAppClient!} setUserAddress={setUserAddress} />
        ) : (
          <DisconnectButton
            Tezos={dAppClient!}
            userAddress={userAddress}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
          />
        )}

        <div>
          I am {userAddress} with {userBalance} CTEZ-tickets ({ticketBytes})
        </div>

        <br />
        <div>
          Enter L2 address here :
          <input
            value={userAddress2}
            onChange={(e) => setUserAddress2(e.currentTarget.value)}
          ></input>
          <button onClick={handleL2Transfer}>
            Send money (DekuTransferRequest)
          </button>
          <button onClick={handleL2Sign}>
            Send money (DekuSign aka magic bytes)
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
