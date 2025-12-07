import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm dark:bg-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Billiards Boss
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
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
          <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white sm:text-6xl">
            Free Billiards Bowling
            <br />
            <span className="text-indigo-600 dark:text-indigo-400">
              Scoring System
            </span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400">
            Track your billiards bowling scores completely free. No hidden fees,
            no limits on your passion. Compete with friends, track your stats,
            and improve your game.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/play"
              className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Try It Free
            </Link>
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700"
            >
              Sign Up to Save
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-4 bg-gray-200 text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-300 transition-colors shadow-lg dark:bg-gray-700 dark:text-gray-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 dark:bg-gray-800">
            <div className="text-4xl mb-4">🎱</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Free Score Saving
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Save unlimited games for free. No subscription required, no hidden
              fees. Your scores, your data.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 dark:bg-gray-800">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Track Statistics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your performance with detailed statistics, strike rates,
              and progress over time.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 dark:bg-gray-800">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Real-time Multiplayer
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Play with friends in real-time. See scores update instantly as
              players take their turns.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-lg shadow-xl p-12 dark:bg-gray-800">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Why Choose Billiards Boss?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4">
                Billiards Boss
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>✅ Free score saving</li>
                <li>✅ Unlimited games (free plan)</li>
                <li>✅ Modern, intuitive UI</li>
                <li>✅ Real-time multiplayer</li>
                <li>✅ Detailed statistics</li>
                <li>✅ No credit card required</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
                Other Platforms
              </h4>
              <ul className="space-y-2 text-gray-500 dark:text-gray-500">
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
        <div className="bg-indigo-600 rounded-lg shadow-xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Scoring?
          </h3>
          <p className="text-indigo-100 mb-8 text-lg">
            Join thousands of players tracking their billiards bowling scores
            for free.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Billiards Boss. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
