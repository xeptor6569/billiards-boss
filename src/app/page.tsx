import { Suspense } from "react";
import AuthCheck from "@/components/AuthCheck";
import HomeContent from "@/components/HomeContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Suspense fallback={null}>
        <AuthCheck />
      </Suspense>
      <HomeContent />
    </div>
  );
}
