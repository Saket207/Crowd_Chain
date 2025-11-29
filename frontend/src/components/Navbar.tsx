"use client";

import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletConnect } from "./WalletConnect";

export function Navbar() {
    const { connected } = useWallet();

    return (
        <nav className="flex items-center justify-between p-6 bg-slate-900 border-b border-slate-800" suppressHydrationWarning>
            <Link href="/" className="text-2xl font-bold text-teal-400">
                CrowdFix
            </Link>
            <div className="flex items-center gap-6">
                <Link href="/report" className="hover:text-teal-400 transition-colors">
                    Report Issue
                </Link>
                <Link href="/profile" className="hover:text-teal-400 transition-colors">
                    Profile
                </Link>
                <Link href="/leaderboard" className="hover:text-teal-400 transition-colors">
                    Leaderboard
                </Link>
                <Link href="/admin" className="hover:text-teal-400 transition-colors text-amber-400">
                    Government
                </Link>
                <WalletConnect />
            </div>
        </nav>
    );
}
