import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "CrowdFix",
    description: "Web3 Social Reporting & Reward App",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <WalletProvider>
                    <div className="min-h-screen flex flex-col relative z-10">
                        <Navbar />
                        <main className="flex-1 container mx-auto px-4 py-8">
                            {children}
                        </main>
                    </div>
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                background: '#1e293b',
                                color: '#fff',
                                border: '1px solid #334155',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#2dd4bf',
                                    secondary: '#1e293b',
                                },
                            },
                        }}
                    />
                </WalletProvider>
            </body>
        </html>
    );
}
