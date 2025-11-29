"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";
import { MODULE_ADDRESS, MODULE_NAME, NODE_URL } from "@/constants";
import { Trophy, Medal, Award } from "lucide-react";

const client = new AptosClient(NODE_URL);

type LeaderboardUser = {
    address: string;
    points: number;
    issuesResolved: number;
    rank: number;
};

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { account } = useWallet();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        setIsLoading(true);
        try {
            // 1. Get all issues to find active users
            const payload = {
                function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_all_issues`,
                type_arguments: [],
                arguments: [],
            };
            const response = await client.view(payload);
            const allIssues = response[0] as any[];

            // 2. Extract unique reporter addresses
            const uniqueReporters = Array.from(new Set(allIssues.map((i: any) => i.reporter)));

            // 3. Fetch profile for each reporter
            const userProfiles = await Promise.all(
                uniqueReporters.map(async (addr: any) => {
                    try {
                        const resource = await client.getAccountResource(
                            addr,
                            `${MODULE_ADDRESS}::${MODULE_NAME}::UserProfile`
                        );
                        const data = resource.data as any;
                        return {
                            address: addr,
                            points: parseInt(data.crowd_points),
                            issuesResolved: parseInt(data.resolved_issues),
                        };
                    } catch (e) {
                        return null;
                    }
                })
            );

            // 4. Filter nulls and sort by points
            const sortedUsers = userProfiles
                .filter((u): u is { address: string; points: number; issuesResolved: number } => u !== null)
                .sort((a, b) => b.points - a.points)
                .map((u, index) => ({ ...u, rank: index + 1 }));

            setUsers(sortedUsers);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
            case 2: return <Medal className="w-6 h-6 text-slate-300" />;
            case 3: return <Award className="w-6 h-6 text-amber-600" />;
            default: return <span className="font-bold text-slate-500">#{rank}</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-teal-400">Community Leaderboard</h1>
                <p className="text-slate-400">Top contributors making their city better</p>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading rankings...</div>
            ) : (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Rank</th>
                                    <th className="px-6 py-4 font-medium">User</th>
                                    <th className="px-6 py-4 font-medium text-center">Issues Resolved</th>
                                    <th className="px-6 py-4 font-medium text-right">CrowdPoints</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {users.map((user) => (
                                    <tr
                                        key={user.address}
                                        className={`hover:bg-slate-700/50 transition-colors ${user.address === account?.address ? "bg-teal-500/10" : ""}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getRankIcon(user.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm">
                                            {user.address === account?.address ? (
                                                <span className="text-teal-400 font-bold">You</span>
                                            ) : (
                                                <span>{user.address.slice(0, 6)}...{user.address.slice(-4)}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-300">
                                            {user.issuesResolved}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-teal-400">
                                            {user.points} CP
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            No ranked users yet. Be the first to report an issue!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
