"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren, useMemo } from "react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { Network } from "@aptos-labs/ts-sdk";

export const WalletProvider = ({ children }: PropsWithChildren) => {
    const wallets = useMemo(() => [new PetraWallet()], []);

    return (
        <AptosWalletAdapterProvider
            plugins={wallets}
            autoConnect={false}
            dappConfig={{ network: Network.TESTNET }}
        >
            {children}
        </AptosWalletAdapterProvider>
    );
};
