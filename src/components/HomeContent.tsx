"use client";

import Link from "next/link";

export default function HomeContent() {
  return (
    <>
      {/* Navigation */}
      <nav className="backdrop-blur-sm shadow-sm" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                Billiards Boss
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="transition-colors"
                style={{ color: 'var(--color-textSecondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-textPrimary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-textSecondary)';
                }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-md transition-colors"
                style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
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
          <h2 className="text-5xl font-extrabold sm:text-6xl" style={{ color: 'var(--color-textPrimary)' }}>
            Free Billiards Bowling
            <br />
            <span style={{ color: 'var(--color-primary)' }}>
              Scoring System
            </span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl" style={{ color: 'var(--color-textSecondary)' }}>
            Track your billiards bowling scores completely free. No hidden fees,
            no limits on your passion. Compete with friends, track your stats,
            and improve your game.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/play"
              className="px-8 py-4 text-white text-lg font-semibold rounded-lg transition-colors shadow-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Try It Free
            </Link>
            <Link
              href="/auth/signup"
              className="px-8 py-4 text-lg font-semibold rounded-lg transition-colors shadow-lg"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
            >
              Sign Up to Save
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-4 text-lg font-semibold rounded-lg transition-colors shadow-lg"
              style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-textPrimary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-textSecondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-border)';
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-4xl mb-4">🎱</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-textPrimary)' }}>
              Free Score Saving
            </h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Save unlimited games for free. No subscription required, no hidden
              fees. Your scores, your data.
            </p>
          </div>

          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-textPrimary)' }}>
              Track Statistics
            </h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Monitor your performance with detailed statistics, strike rates,
              and progress over time.
            </p>
          </div>

          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-textPrimary)' }}>
              Real-time Multiplayer
            </h3>
            <p style={{ color: 'var(--color-textSecondary)' }}>
              Play with friends in real-time. See scores update instantly as
              players take their turns.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-lg shadow-xl p-12" style={{ backgroundColor: 'var(--color-surface)' }}>
          <h3 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-textPrimary)' }}>
            Why Choose Billiards Boss?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-success)' }}>
                Billiards Boss
              </h4>
              <ul className="space-y-2" style={{ color: 'var(--color-textPrimary)' }}>
                <li>✅ Free score saving</li>
                <li>✅ Unlimited games (free plan)</li>
                <li>✅ Modern, intuitive UI</li>
                <li>✅ Real-time multiplayer</li>
                <li>✅ Detailed statistics</li>
                <li>✅ No credit card required</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-textSecondary)' }}>
                Other Platforms
              </h4>
              <ul className="space-y-2" style={{ color: 'var(--color-textSecondary)' }}>
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
        <div className="rounded-lg shadow-xl p-12 text-center" style={{ backgroundColor: 'var(--color-primary)' }}>
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Scoring?
          </h3>
          <p className="mb-8 text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Join thousands of players tracking their billiards bowling scores
            for free.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-colors shadow-lg"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: 'var(--color-textPrimary)', color: 'var(--color-background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Billiards Boss. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
