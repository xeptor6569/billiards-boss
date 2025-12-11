"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function AppNavigation({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Highlight active link helper
    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const navItems = [
        {
            label: "Home",
            href: "/dashboard",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
            ),
        },
        {
            label: "Game",
            href: "/dashboard/games/new",
            isPrimary: true, // Special styling for main action
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            ),
        },
        {
            label: "History",
            href: "/dashboard/history",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
        },
        {
            label: "Stats",
            href: "/dashboard/stats",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex h-[100dvh]" style={{ backgroundColor: 'var(--color-background)' }}>
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="hidden md:flex w-64 flex-col border-r" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="p-6">
                    <Link href="/dashboard" className="flex items-center gap-2 text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                        <span>🎱</span> Billiards Boss
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const active = isActive(item.href) && item.href !== '/dashboard/games/new';
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    item.isPrimary ? "mt-6 shadow-md justify-center" : ""
                                }`}
                                style={{
                                    backgroundColor: item.isPrimary 
                                        ? 'var(--color-primary)' 
                                        : active 
                                            ? 'var(--color-primary)' 
                                            : 'transparent',
                                    color: item.isPrimary || active 
                                        ? '#ffffff' 
                                        : 'var(--color-textSecondary)',
                                }}
                                onMouseEnter={(e) => {
                                    if (!item.isPrimary && !active) {
                                        e.currentTarget.style.backgroundColor = 'var(--color-border)';
                                        e.currentTarget.style.color = 'var(--color-textPrimary)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!item.isPrimary && !active) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--color-textSecondary)';
                                    }
                                }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--color-border)' }}>
                    <ThemeSwitcher />
                    <div className="text-xs text-center" style={{ color: 'var(--color-textSecondary)' }}>
                        v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Top Bar */}
                <header className="md:hidden flex items-center justify-between p-4 border-b" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>Billiards Boss</h1>
                    <ThemeSwitcher />
                </header>

                <main className="flex-1 overflow-y-auto pb-safe">
                    {children}
                </main>

                {/* Mobile Bottom Nav (Hidden during gameplay) */}
                {!pathname.startsWith('/dashboard/games/') && (
                    <nav className="md:hidden border-t pb-safe" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="flex justify-around items-end h-16 pb-2">
                            {navItems.map((item) => {
                                const active = isActive(item.href);

                                if (item.isPrimary) {
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="relative -top-5 p-4 rounded-full shadow-lg transition-transform active:scale-95"
                                            style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.opacity = '0.9';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.opacity = '1';
                                            }}
                                        >
                                            {item.icon}
                                        </Link>
                                    )
                                }

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex flex-col items-center justify-center w-full h-full space-y-1"
                                        style={{ color: active ? 'var(--color-primary)' : 'var(--color-textSecondary)' }}
                                        onMouseEnter={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.color = 'var(--color-textPrimary)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.color = 'var(--color-textSecondary)';
                                            }
                                        }}
                                    >
                                        {item.icon}
                                        <span className="text-[10px] font-medium">{item.label}</span>
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

