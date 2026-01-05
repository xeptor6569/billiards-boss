"use client";

import Link from "next/link";
import { trackCTAClick } from "@/lib/analytics";

export default function HomeContent() {
  return (
    <>
      {/* Navigation */}
      <nav className="backdrop-blur-sm shadow-sm bg-white/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[var(--accent)]">
                Billiards Boss
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/play"
                className="hidden sm:inline-flex transition-colors text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Play now
              </Link>
              <Link
                href="/auth/signin"
                className="transition-colors text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-md transition-opacity bg-[var(--accent)] text-white hover:opacity-90 shadow-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-semibold">
            🎉 10 Games Free • Much Cheaper Than Bowlliards
          </div>
          <h2 className="text-5xl font-extrabold sm:text-6xl text-slate-900 dark:text-slate-100">
            Professional Billiards
            <br />
            <span className="text-[var(--accent)]">
              Scorekeeper
            </span>
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-slate-700 dark:text-slate-300">
            The <strong>affordable</strong>, modern alternative to expensive scorekeepers. Track APA 8-ball, APA 9-ball, 
            straight pool, and more with a beautiful, reliable interface. <strong>10 games free</strong> - Bowlliards charges for every game.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/play"
              className="px-8 py-4 text-white text-lg font-semibold rounded-lg transition-opacity shadow-lg bg-[var(--accent)] hover:opacity-90"
              onClick={() => trackCTAClick("start_scoring", "hero")}
            >
              Start Scoring Now
            </Link>
            <Link
              href="/auth/signup"
              className="px-8 py-4 text-lg font-semibold rounded-lg transition-colors shadow-lg bg-white dark:bg-slate-800 text-[var(--accent)] border-2 border-[var(--accent)] hover:bg-slate-50 dark:hover:bg-slate-700"
              onClick={() => trackCTAClick("signup", "hero")}
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      {/* Game Types */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Score All Your Favorite Games
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Professional scoring for APA leagues, tournaments, and casual play
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">🎱</div>
            <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              APA 8-Ball
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Full Equalizer® system with skill levels, rack tracking, and match points
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              APA 9-Ball
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Complete scoring with innings, defensive shots, and skill level targets
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">🎳</div>
            <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Bowlliards
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Score billiards bowling games with frame-by-frame tracking
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">📊</div>
            <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Straight Pool
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              14.1 continuous pool scoring with run tracking and statistics
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            How Billiards Boss works
          </h3>
          <div className="grid gap-4 sm:grid-cols-3 text-left">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)] mb-1">
                1. Start Scoring
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Choose your game type and start tracking scores instantly. No signup required to begin.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)] mb-1">
                2. Save & Sync
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                Create a free account to save unlimited games, edit past scores, and access from any device.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)] mb-1">
                3. Track Progress
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                View detailed statistics, win rates, and performance trends to measure your improvement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Why Players Choose Billiards Boss
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-8 bg-white dark:bg-slate-800">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              10 Games Free
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              Save your first 10 games completely free. No credit card required. 
              Unlike Bowlliards which charges for every game, we give you 10 games to start.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-8 bg-white dark:bg-slate-800">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Modern & Reliable
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              Beautiful, intuitive interface that actually works. No crashes, no bugs, no frustration. 
              Built for players who want a better experience than the official APA app.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-8 bg-white dark:bg-slate-800">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Complete Statistics
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              Track win rates, averages, skill progression, and detailed game history. 
              Everything you need to measure and improve your game.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-8 bg-white dark:bg-slate-800">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Mobile-First Design
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              Optimized for phones and tablets. Works perfectly on any device, 
              whether you're at the pool hall or practicing at home.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-8 bg-white dark:bg-slate-800">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Better Value
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              Premium plans cost <strong>much less</strong> than Bowlliards and include way more: 
              custom scorekeepers, multiplayer, tournaments, sharing, and unlimited games.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-8 bg-white dark:bg-slate-800 relative">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                Coming Soon
              </span>
            </div>
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Real-time Multiplayer
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              Play with friends in real-time. See scores update instantly as
              players take their turns. Perfect for league nights.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 sm:p-12 bg-white dark:bg-slate-800">
          <h3 className="text-3xl font-bold text-center mb-4 text-slate-900 dark:text-slate-100">
            Better Value Than Expensive Scorekeepers
          </h3>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Get 10 games free to start, then pay much less than Bowlliards for premium features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border-2 border-green-500 dark:border-green-400 p-6 bg-green-50 dark:bg-green-900/20">
              <h4 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300">
                Billiards Boss
              </h4>
              <ul className="space-y-3 text-slate-900 dark:text-slate-100">
                <li className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2">✅</span>
                  <span><strong>10 games free</strong> - No credit card needed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2">✅</span>
                  <span><strong>Much cheaper</strong> premium than Bowlliards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2">✅</span>
                  <span><strong>More features:</strong> Custom scorekeepers, multiplayer, tournaments, sharing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2">✅</span>
                  <span><strong>Modern UI</strong> - Beautiful & intuitive</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2">✅</span>
                  <span><strong>Reliable</strong> - No crashes or bugs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 dark:text-green-400 mr-2">✅</span>
                  <span><strong>Complete stats</strong> & game history</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-300 dark:border-slate-600 p-6 bg-slate-50 dark:bg-slate-900/50">
              <h4 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">
                Bowlliards
              </h4>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start">
                  <span className="text-red-600 dark:text-red-400 mr-2">❌</span>
                  <span><strong>Charges for</strong> every game saved</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 dark:text-red-400 mr-2">❌</span>
                  <span><strong>Expensive</strong> subscription pricing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 dark:text-red-400 mr-2">❌</span>
                  <span><strong>Limited features</strong> - Basic scoring only</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 dark:text-red-400 mr-2">❌</span>
                  <span><strong>Credit card</strong> required upfront</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-300 dark:border-slate-600 p-6 bg-slate-50 dark:bg-slate-900/50">
              <h4 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">
                Official APA App
              </h4>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start">
                  <span className="text-red-600 dark:text-red-400 mr-2">❌</span>
                  <span><strong>Outdated</strong> interface</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 dark:text-red-400 mr-2">❌</span>
                  <span><strong>Unreliable</strong> - Crashes & bugs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 dark:text-red-400 mr-2">❌</span>
                  <span><strong>Poor UX</strong> - Hard to use</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 dark:text-red-400 mr-2">❌</span>
                  <span><strong>Limited</strong> features</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Why create an account */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 sm:p-10 shadow-lg flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
              Start with 10 free games
            </h3>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-start">
                <span className="text-[var(--accent)] mr-2">✓</span>
                <span>Save your first <strong>10 games free</strong> - no credit card required</span>
              </li>
              <li className="flex items-start">
                <span className="text-[var(--accent)] mr-2">✓</span>
                <span>Access <strong>detailed statistics</strong> and performance trends</span>
              </li>
              <li className="flex items-start">
                <span className="text-[var(--accent)] mr-2">✓</span>
                <span><strong>Sync across devices</strong> - use on phone, tablet, or computer</span>
              </li>
              <li className="flex items-start">
                <span className="text-[var(--accent)] mr-2">✓</span>
                <span>Upgrade for <strong>unlimited games</strong>, multiplayer, tournaments, custom scorekeepers, and sharing</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Link
              href="/auth/signup"
              className="inline-flex justify-center px-6 py-3 rounded-lg font-semibold bg-[var(--accent)] text-white shadow-lg hover:opacity-90 transition-opacity"
              onClick={() => trackCTAClick("signup", "why_create_account")}
            >
              Create Free Account
            </Link>
            <Link
              href="/play"
              className="inline-flex justify-center px-6 py-3 rounded-lg font-semibold border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Try Without Signup
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-xl shadow-xl p-12 text-center bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Score Like a Pro?
          </h3>
          <p className="mb-8 text-lg text-white/95 max-w-2xl mx-auto">
            Join players who've switched from expensive scorekeepers to Billiards Boss. 
            Get 10 games free, then upgrade for much less than Bowlliards with way more features.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/play"
              className="inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-colors shadow-lg bg-white text-[var(--accent)] hover:bg-slate-50"
              onClick={() => trackCTAClick("start_scoring", "final_cta")}
            >
              Start Scoring Now
            </Link>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-colors shadow-lg bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20"
              onClick={() => trackCTAClick("signup", "final_cta")}
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 dark:bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Billiards Boss. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
