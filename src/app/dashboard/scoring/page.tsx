import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ScoringPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          How to Score
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Learn how billiards bowling scoring works and master the game.
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        {/* What is Billiards Bowling */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            What is Billiards Bowling?
          </h2>
          <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              <strong>Billiards Bowling</strong> (also called "Bowlliards") is a unique scoring system that combines:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
              <li><strong>10-ball pocket billiards</strong> gameplay</li>
              <li><strong>Bowling-style scoring</strong> (10 frames per game)</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              Instead of traditional billiards scoring, each game consists of 10 frames, just like bowling. Each frame represents one turn at the table where you try to pocket all 10 balls.
            </p>
          </div>
        </section>

        {/* Basic Scoring Rules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Basic Scoring Rules
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                Game Structure
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                <li><strong>10 frames</strong> per game</li>
                <li>Each frame starts with <strong>10 balls</strong> on the table</li>
                <li>You have up to <strong>2 shots</strong> per frame (except the 10th frame, which can have 3)</li>
                <li>Score is the total number of balls pocketed, with bonuses for strikes and spares</li>
              </ul>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                Entering Scores
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                <li>After each shot, enter how many balls you pocketed (0-10)</li>
                <li>The app automatically calculates remaining balls</li>
                <li>You cannot pocket more balls than are available on the table</li>
                <li>A miss is entered as <strong>0</strong> balls</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Understanding Strikes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Understanding Strikes
          </h2>
          <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
              What is a Strike?
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              A <strong>strike</strong> occurs when you pocket all 10 balls on your <strong>first shot</strong> of a frame.
            </p>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg mb-4">
              <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Strike Marking:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
                <li>Marked with an <strong>"X"</strong> in the scorecard</li>
                <li>In regular frames (1-9), a strike <strong>ends the frame immediately</strong></li>
                <li>You get a bonus based on your next shots</li>
              </ul>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Examples:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
                <li><strong>Frame 1, Shot 1</strong>: Pocket 10 balls → <strong>Strike (X)</strong></li>
                <li><strong>Frame 2, Shot 1</strong>: Pocket 7 balls → No strike</li>
                <li><strong>Frame 3, Shot 1</strong>: Pocket 10 balls → <strong>Strike (X)</strong></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Understanding Spares */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Understanding Spares
          </h2>
          <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
              What is a Spare?
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              A <strong>spare</strong> occurs when you pocket all 10 balls using <strong>both shots</strong> in a frame (but not on the first shot).
            </p>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg mb-4">
              <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Spare Marking:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-4">
                <li>Marked with a <strong>"/"</strong> in the scorecard</li>
                <li>Only possible if the first shot was NOT a strike</li>
                <li>In regular frames (1-9), a spare <strong>ends the frame</strong></li>
                <li>You get a bonus based on your next shot</li>
              </ul>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Examples:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                <li>
                  <strong>Frame 1, Shot 1</strong>: Pocket 7 balls<br />
                  <strong>Frame 1, Shot 2</strong>: Pocket 3 balls → <strong>Spare (/)</strong> (7 + 3 = 10)
                </li>
                <li>
                  <strong>Frame 2, Shot 1</strong>: Pocket 4 balls<br />
                  <strong>Frame 2, Shot 2</strong>: Pocket 6 balls → <strong>Spare (/)</strong> (4 + 6 = 10)
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* The 10th Frame */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            The 10th Frame (Special Rules)
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            The 10th frame has special rules that allow for bonus shots:
          </p>
          
          <div className="space-y-4">
            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                10th Frame with a Strike
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-3">
                If you get a strike on the first shot:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4 mb-4">
                <li>You get <strong>2 additional shots</strong></li>
                <li>Each strike resets the available balls to 10</li>
                <li>You can have multiple strikes in the 10th frame</li>
                <li><strong>Maximum possible</strong>: 3 strikes (30 balls total)</li>
              </ul>
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Example:</p>
                <ul className="list-none space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• Shot 1: 10 balls (Strike) → 10 balls available for shot 2</li>
                  <li>• Shot 2: 10 balls (Strike) → 10 balls available for shot 3</li>
                  <li>• Shot 3: 8 balls</li>
                  <li>• <strong>Total: 28 balls</strong></li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                10th Frame with a Spare
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-3">
                If you get a spare (10 balls in 2 shots):
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4 mb-4">
                <li>You get <strong>1 additional shot</strong></li>
                <li>The bonus shot starts with 10 balls available</li>
                <li><strong>Maximum possible</strong>: 20 balls (10 + 10)</li>
              </ul>
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Example:</p>
                <ul className="list-none space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• Shot 1: 7 balls</li>
                  <li>• Shot 2: 3 balls (Spare) → 10 balls available for shot 3</li>
                  <li>• Shot 3: 6 balls</li>
                  <li>• <strong>Total: 16 balls</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How Bonuses Work */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            How Bonuses Work
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Bonuses are added to your frame score based on what happens in <strong>future frames</strong>. This is why strike and spare scores may not be finalized until later frames are completed.
          </p>
          
          <div className="space-y-4">
            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                Strike Bonus
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-3">
                When you get a strike in frames 1-9:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4 mb-4">
                <li>Your strike frame score = <strong>10 + next 2 balls pocketed</strong></li>
                <li>The bonus comes from your next frame's shots</li>
              </ul>
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg mb-4">
                <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Example:</p>
                <ul className="list-none space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• Frame 1: Strike (X) → Score not yet known</li>
                  <li>• Frame 2, Shot 1: 7 balls</li>
                  <li>• Frame 2, Shot 2: 2 balls</li>
                  <li>• <strong>Frame 1 final score: 10 + 7 + 2 = 19</strong></li>
                </ul>
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Another Example:</p>
                <ul className="list-none space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• Frame 3: Strike (X) → Score not yet known</li>
                  <li>• Frame 4: Strike (X) → Still need one more ball</li>
                  <li>• Frame 5, Shot 1: 5 balls</li>
                  <li>• <strong>Frame 3 final score: 10 + 10 + 5 = 25</strong></li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                Spare Bonus
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-3">
                When you get a spare in frames 1-9:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4 mb-4">
                <li>Your spare frame score = <strong>10 + next 1 ball pocketed</strong></li>
                <li>The bonus comes from your next frame's first shot</li>
              </ul>
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Example:</p>
                <ul className="list-none space-y-1 text-slate-700 dark:text-slate-300">
                  <li>• Frame 2: Spare (/) → Score not yet known</li>
                  <li>• Frame 3, Shot 1: 8 balls</li>
                  <li>• <strong>Frame 2 final score: 10 + 8 = 18</strong></li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                10th Frame Scoring
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                <li><strong>No bonuses needed</strong> - all balls pocketed count directly toward your score</li>
                <li>The 10th frame score is simply the sum of all balls pocketed in that frame</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Q: Can I edit a score after entering it?
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>A:</strong> Yes! If you've saved the game, you can edit any frame by clicking on it. You can correct mistakes, adjust scores, or change any shot.
              </p>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Q: What happens if I enter more balls than are available?
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>A:</strong> The app automatically prevents this. You cannot pocket more balls than are on the table. The system will clamp your entry to the maximum available.
              </p>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Q: Can I have a strike on the second shot?
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>A:</strong> No. A strike can only occur on the first shot of a frame (when you pocket all 10 balls). If you pocket 10 balls on the second shot, that's a spare (assuming you didn't pocket all 10 on the first shot).
              </p>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Q: Why does my strike/spare score show as incomplete?
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>A:</strong> Strike and spare bonuses depend on future frames. Your score will be finalized once you complete the necessary shots in the next frame(s). This is normal bowling scoring behavior.
              </p>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Q: What's the maximum possible score?
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>A:</strong> The theoretical maximum is <strong>300</strong> (12 strikes: 10 regular frames + 2 bonus strikes in the 10th frame). However, in practice, scoring 300 requires perfect play across all frames.
              </p>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Q: Can I play without creating an account?
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>A:</strong> Yes! You can use the scoring interface without an account. However, to save games and track statistics, you'll need to create a free account.
              </p>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Q: What's the difference between a strike and a spare?
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>A:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 ml-4 text-slate-700 dark:text-slate-300">
                <li><strong>Strike</strong>: All 10 balls on the first shot (marked "X")</li>
                <li><strong>Spare</strong>: All 10 balls in 2 shots, where the first shot was NOT a strike (marked "/")</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Tips for Better Scoring
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                1. Focus on Consistency
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                Aim for consistent shot-making rather than always going for strikes. Spares are valuable and easier to achieve than strikes.
              </p>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                2. Understand the 10th Frame
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                The 10th frame is your chance to maximize your score. A strike gives you 2 bonus shots, a spare gives you 1.
              </p>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                3. Track Your Progress
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                Save your games to track improvement over time. Review your statistics to identify patterns and focus on improving your spare conversion rate.
              </p>
            </div>

            <div className="rounded-lg shadow-md p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                4. Practice Frame Management
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                Don't always go for the strike - sometimes playing for a spare is smarter. Learn to read the table and adjust your strategy.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
