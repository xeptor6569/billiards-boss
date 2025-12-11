"use client";

import Link from "next/link";

export default function HomeContent() {
  return (
    <>
      {/* Navigation */}
      <nav className="backdrop-blur-sm shadow-sm bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[var(--accent)]">
                Billiards Boss
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-md transition-opacity bg-[var(--accent)] text-white hover:opacity-90"
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
          <h2 className="text-5xl font-extrabold sm:text-6xl text-slate-900 dark:text-slate-100">
            Free Billiards Bowling
            <br />
            <span className="text-[var(--accent)]">
              Scoring System
            </span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400">
            Track your billiards bowling scores completely free. No hidden fees,
            no limits on your passion. Compete with friends, track your stats,
            and improve your game.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/play"
              className="px-8 py-4 text-white text-lg font-semibold rounded-lg transition-opacity shadow-lg bg-[var(--accent)] hover:opacity-90"
            >
              Try It Free
            </Link>
            <Link
              href="/auth/signup"
              className="px-8 py-4 text-lg font-semibold rounded-lg transition-colors shadow-lg bg-slate-50 dark:bg-slate-800 text-[var(--accent)] hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Sign Up to Save
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-4 text-lg font-semibold rounded-lg transition-colors shadow-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-lg shadow-lg p-8 bg-slate-50 dark:bg-slate-800">
            <div className="text-4xl mb-4">🎱</div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Free Score Saving
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Save unlimited games for free. No subscription required, no hidden
              fees. Your scores, your data.
            </p>
          </div>

          <div className="rounded-lg shadow-lg p-8 bg-slate-50 dark:bg-slate-800">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Track Statistics
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Monitor your performance with detailed statistics, strike rates,
              and progress over time.
            </p>
          </div>

          <div className="rounded-lg shadow-lg p-8 bg-slate-50 dark:bg-slate-800">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Real-time Multiplayer
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Play with friends in real-time. See scores update instantly as
              players take their turns.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-lg shadow-xl p-12 bg-slate-50 dark:bg-slate-800">
          <h3 className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-slate-100">
            Why Choose Billiards Boss?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
                Billiards Boss
              </h4>
              <ul className="space-y-2 text-slate-900 dark:text-slate-100">
                <li>✅ Free score saving</li>
                <li>✅ Unlimited games (free plan)</li>
                <li>✅ Modern, intuitive UI</li>
                <li>✅ Real-time multiplayer</li>
                <li>✅ Detailed statistics</li>
                <li>✅ No credit card required</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4 text-slate-600 dark:text-slate-400">
                Other Platforms
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>❌ Paid score saving</li>
                <li>❌ Limited free games</li>
                <li>❌ Outdated interface</li>
                <li>❌ Premium features locked</li>
                <li>❌ Basic statistics</li>
                <li>❌ Subscription required</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-lg shadow-xl p-12 text-center bg-[var(--accent)]">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Scoring?
          </h3>
          <p className="mb-8 text-lg text-white/90">
            Join thousands of players tracking their billiards bowling scores
            for free.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-colors shadow-lg bg-white text-[var(--accent)] hover:bg-slate-50"
          >
            Get Started Free
          </Link>
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
