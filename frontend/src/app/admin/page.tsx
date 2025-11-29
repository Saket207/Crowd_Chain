"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";
import { MODULE_ADDRESS, MODULE_NAME, NODE_URL } from "@/constants";

const client = new AptosClient(NODE_URL);

// Define Issue type matching the Move struct
type Issue = {
  id: string;
  reporter: string;
  category: string;
  description: string;
  location: string;
  image_url: string;
  status: number; // 0: Pending, 1: Resolved, 2: Rejected
  timestamp: string;
};

export default function AdminPage() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const payload = {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_all_issues`,
        type_arguments: [],
        arguments: [],
      };
      const response = await client.view(payload);
      // The response is an array containing the return values. 
      // get_all_issues returns vector<Issue>, so response[0] is the array of issues.
      const allIssues = response[0] as any[];

      // Map and filter for pending issues (status 0)
      const pendingIssues = allIssues.map((issue: any) => ({
        id: issue.id,
        reporter: issue.reporter,
        category: issue.category,
        description: issue.description,
        location: issue.location,
        image_url: issue.image_url,
        status: issue.status,
        timestamp: new Date(parseInt(issue.timestamp) * 1000).toLocaleString(),
      })).filter((issue) => issue.status === 0);

      setIssues(pendingIssues);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    if (!account) {
      alert("Please connect admin wallet");
      return;
    }

    try {
      const payload = {
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::resolve_issue`,
          functionArguments: [
            id,
            "10", // Award 10 points (fixed amount as requested)
          ],
        },
      };

      const response = await signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      alert("Issue resolved! CrowdPoints sent to reporter. Tx: " + response.hash);

      // Refresh list
      fetchIssues();
    } catch (error) {
      console.error("Error resolving issue:", error);
      alert("Failed to resolve issue. Are you the admin?");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-teal-400">Government Dashboard</h1>
          <p className="text-slate-400">Verify and resolve reported issues.</p>
        </div>
        <div className="text-right text-xs font-mono text-slate-500 bg-slate-900 p-2 rounded border border-slate-800">
          <p>Connected: {account?.address || "Not Connected"}</p>
          <p>Expected Admin: {MODULE_ADDRESS}</p>
          {account?.address !== MODULE_ADDRESS && (
            <p className="text-red-400 font-bold mt-1">⚠️ NOT AUTHORIZED</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-500 py-12">Loading issues from blockchain...</div>
      ) : (
        <div className="grid gap-6">
          {issues.map((issue) => (
            <div key={issue.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                <img
                  src={issue.image_url}
                  alt={issue.category}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image";
                  }}
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{issue.category}</h3>
                    <p className="text-sm text-slate-400">{issue.location} • {issue.timestamp}</p>
                  </div>
                  <div className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-500">
                    ID: {issue.id}
                  </div>
                </div>
                <p className="text-slate-300">{issue.description}</p>
                <div className="text-sm text-slate-500 font-mono">Reporter: {issue.reporter.slice(0, 6)}...{issue.reporter.slice(-4)}</div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => handleResolve(issue.id)}
                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve & Reward (10 CP)
                  </button>
                  <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
          {issues.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No pending issues to review. Good job!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
