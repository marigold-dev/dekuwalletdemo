import {
    AccountInfo, BeaconMessageType, DAppClient, DekuPermissionRequest, DekuPermissionResponse, DekuPermissionScope, NetworkType, PermissionRequestV3
} from "@airgap/beacon-sdk";
import { Dispatch, SetStateAction } from "react";

type ButtonProps = {
    Tezos: DAppClient;
    setUserAddress: Dispatch<SetStateAction<string>>;
};

const ConnectButton = ({
    Tezos,
    setUserAddress
}: ButtonProps): JSX.Element => {

    const connectWallet = async (): Promise<void> => {
        try {
            //to authorize new connection
            await Tezos.clearActiveAccount();
            console.log("dappBeacon", Tezos);

            const dekuPermissionRequest: DekuPermissionRequest = {
                blockchainIdentifier: "deku",
                type: BeaconMessageType.PermissionRequest,
                blockchainData: {
                    appMetadata: {
                        senderId: "dekuDemoID",
                        name: "dekuDemo"
                    },
                    scopes: [DekuPermissionScope.transfer],
                    network: {
                        type: NetworkType.CUSTOM,
                        rpcUrl: process.env["REACT_APP_DEKU_NODE"]!
                    },
                }
            };

            let permissions: DekuPermissionResponse = await Tezos.permissionRequest(dekuPermissionRequest as PermissionRequestV3<"deku">) as DekuPermissionResponse;
            console.log("DekuPermissionResponse permissions", permissions)
            /*
            const permissions: PermissionResponseOutput = await Tezos.requestPermissions(
                {
                    network: {
                        type: NetworkType.CUSTOM,
                        rpcUrl: process.env["REACT_APP_DEKU_NODE"]!
                    },
                    scopes: [PermissionScope.OPERATION_REQUEST]
                }
            );*/

            const activeAccount = (await Tezos.getActiveAccount()) as AccountInfo;

            setUserAddress(activeAccount.address);

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="buttons">
            <button className="button" onClick={connectWallet}>
                <span>
                    <i className="fas fa-wallet"></i>&nbsp; Connect with wallet
                </span>
            </button>
        </div>
    );
};

export default ConnectButton;