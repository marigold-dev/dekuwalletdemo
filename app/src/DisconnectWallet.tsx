import { DAppClient } from "@airgap/beacon-sdk";
import { Dispatch, SetStateAction } from "react";

interface ButtonProps {
    Tezos: DAppClient;
    userAddress: string;
    setUserAddress: Dispatch<SetStateAction<string>>;
    setUserBalance: Dispatch<SetStateAction<number>>;
}

const DisconnectButton = ({
    Tezos,
    userAddress,
    setUserAddress,
    setUserBalance
}: ButtonProps): JSX.Element => {
    const disconnectWallet = async (): Promise<void> => {
        setUserAddress("");
        setUserBalance(0);
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