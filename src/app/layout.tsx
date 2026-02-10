import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Taravadu Mane Family Portal",
    description: "Digital home for our Taravadu family",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} h-screen overflow-hidden`}>
                <AuthProvider>
                    <div id="app-scroll" className="h-screen overflow-y-auto app-scroll">
                        {children}
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
