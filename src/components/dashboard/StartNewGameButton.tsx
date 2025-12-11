"use client";

import { useRouter } from "next/navigation";

interface StartNewGameButtonProps {
  activeGameId: number;
}

export default function StartNewGameButton({ activeGameId }: StartNewGameButtonProps) {
  const router = useRouter();

  const handleStartNew = async () => {
    if (confirm("Are you sure you want to abandon your current game and start a new one?")) {
      try {
        // Mark current game as abandoned
        await fetch(`/api/games/${activeGameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "abandoned",
          }),
        });
        // Navigate to new game page
        router.push("/dashboard/games/new");
      } catch (error) {
        console.error("Error abandoning game:", error);
        alert("Failed to start new game. Please try again.");
      }
    }
  };

  return (
    <button
      onClick={handleStartNew}
      className="px-6 py-2 rounded-lg font-semibold transition-colors bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
    >
      Start New
    </button>
  );
}

