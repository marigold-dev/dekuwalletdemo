import {
    DAppClient,
    NetworkType
} from "@airgap/beacon-sdk";
import { Dispatch, SetStateAction } from "react";

type ButtonProps = {
    Tezos: DAppClient;
    setUserAddress: Dispatch<SetStateAction<string>>;
};

const ConnectButton = ({
    Tezos,
    setUserAddress,
}: ButtonProps): JSX.Element => {

    const connectWallet = async (): Promise<void> => {
        try {
            //to authorize new connection
            await Tezos.clearActiveAccount();

            const permissions = await Tezos.requestPermissions({
                network: {
                    type: NetworkType.GHOSTNET,
                    rpcUrl: "https://GHOSTNET.tezos.marigold.dev"
                }
            });
            setUserAddress(permissions.address);

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