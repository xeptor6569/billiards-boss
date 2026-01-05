"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/layout/UserMenu";
import NewGameDropdown from "@/components/layout/NewGameDropdown";
import type { Session } from "next-auth";
import { BUILD_INFO } from "@/lib/build-info";

interface AppNavigationProps {
  children: React.ReactNode;
  session: Session;
}

export default function AppNavigation({ children, session }: AppNavigationProps) {
    const pathname = usePathname();
    const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

    // Fetch user's premium status
    useEffect(() => {
        const fetchPremiumStatus = async () => {
            try {
                const response = await fetch("/api/user/profile");
                if (response.ok) {
                    const profile = await response.json();
                    setHasPremiumAccess(profile.plan?.allowsCustomGames || false);
                }
            } catch (error) {
                console.error("Error fetching premium status:", error);
            }
        };

        if (session?.user?.id) {
            fetchPremiumStatus();
        }
    }, [session?.user?.id]);

    // Highlight active link helper
    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return pathname === path;
        }
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const navItems = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
            ),
        },
        {
            label: "New Game",
            href: "/dashboard/games/new",
            isPrimary: true,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            ),
        },
        {
            label: "History",
            href: "/dashboard/history",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
        },
        {
            label: "Statistics",
            href: "/dashboard/stats",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
            ),
        },
        {
            label: "How to Score",
            href: "/dashboard/scoring",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-900">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                {/* Logo/Brand */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform">
                            🎱
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                Billiards Boss
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                Scorekeeper
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        
                        // Replace primary "New Game" button with dropdown
                        if (item.isPrimary) {
                            return (
                                <NewGameDropdown
                                    key={item.href}
                                    userId={session.user.id}
                                    hasPremiumAccess={hasPremiumAccess}
                                    variant="desktop"
                                />
                            );
                        }
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    active
                                        ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                                }`}
                            >
                                <span className={active ? "text-white" : ""}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                                {active && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Menu & Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <UserMenu session={session} variant="desktop" />
                    <div className="text-xs text-center text-slate-500 dark:text-slate-400 px-2">
                        {BUILD_INFO.display}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Mobile Top Bar */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 flex items-center justify-center text-lg shadow-md">
                            🎱
                        </div>
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            Billiards Boss
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <UserMenu session={session} variant="mobile" />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                    {children}
                </main>

                {/* Mobile Bottom Nav */}
                {!pathname.startsWith('/dashboard/games/') && (
                    <nav className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg pb-safe">
                        <div className="flex justify-around items-center h-20">
                            {navItems.map((item) => {
                                const active = isActive(item.href);

                                if (item.isPrimary) {
                                    return (
                                        <NewGameDropdown
                                            key={item.href}
                                            userId={session.user.id}
                                            hasPremiumAccess={hasPremiumAccess}
                                            variant="mobile"
                                        />
                                    )
                                }

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${
                                            active 
                                                ? "text-[var(--accent)]" 
                                                : "text-slate-500 dark:text-slate-400"
                                        }`}
                                    >
                                        {active && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full bg-[var(--accent)]"></div>
                                        )}
                                        <span className={active ? "scale-110" : ""}>
                                            {item.icon}
                                        </span>
                                        <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
}
