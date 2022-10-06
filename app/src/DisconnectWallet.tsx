import { DAppClient } from "@airgap/beacon-sdk";
import { Dispatch, SetStateAction } from "react";

interface ButtonProps {
    Tezos: DAppClient;
    userAddress: string;
    setUserAddress: Dispatch<SetStateAction<string>>;
}

const DisconnectButton = ({
    Tezos,
    userAddress,
    setUserAddress,
}: ButtonProps): JSX.Element => {
    const disconnectWallet = async (): Promise<void> => {
        setUserAddress("");
        await Tezos.clearActiveAccount();
        Tezos.removeAllAccounts();
        console.log("removing user " + userAddress);
    };

    return (
        <div className="buttons">
            <button className="button" onClick={disconnectWallet}>
                <i className="fas fa-times"></i>&nbsp; Disconnect wallet
            </button>
        </div>
    );
};

export default DisconnectButton;