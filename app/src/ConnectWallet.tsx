import {
    AccountInfo, DAppClient,
    NetworkType,
    PermissionResponseOutput,
    PermissionScope
} from "@airgap/beacon-sdk";
import { Dispatch, SetStateAction } from "react";

type ButtonProps = {
    Tezos: DAppClient;
    setUserAddress: Dispatch<SetStateAction<string>>;
    setActiveAccount: Dispatch<SetStateAction<AccountInfo | undefined>>;
};

const ConnectButton = ({
    Tezos,
    setUserAddress,
    setActiveAccount
}: ButtonProps): JSX.Element => {

    const connectWallet = async (): Promise<void> => {
        try {
            //to authorize new connection
            await Tezos.clearActiveAccount();

            const permissions: PermissionResponseOutput = await Tezos.requestPermissions(
                {
                    network: {
                        type: NetworkType.CUSTOM,
                        rpcUrl: process.env["REACT_APP_DEKU_NODE"]!
                    },
                    scopes: [PermissionScope.OPERATION_REQUEST]
                }
            );
            setUserAddress(permissions.address);
            setActiveAccount(permissions.accountInfo);

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