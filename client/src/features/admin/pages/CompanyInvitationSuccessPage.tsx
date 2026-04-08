import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Card } from "@shared/components/data-display/Card";

export const CompanyInvitationSuccessPage = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,244,245,0.95),_rgba(250,250,250,1)_44%,_rgba(228,228,231,0.72)_100%)] px-4 py-10 text-zinc-950 dark:bg-[radial-gradient(circle_at_top,_rgba(39,39,42,0.34),_rgba(9,9,11,1)_42%,_rgba(9,9,11,1)_100%)] dark:text-zinc-50 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <Card className="w-full border-zinc-200/80 bg-white/92 p-8 text-center shadow-2xl shadow-zinc-200/40 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/88 dark:shadow-black/30 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-zinc-400 dark:text-zinc-500">
              Account Ready
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your account has been created
            </h1>
            <p className="text-lg font-medium text-zinc-600 dark:text-zinc-300">
              Welcome to SkillSense
            </p>
            <p className="mx-auto max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Your company admin account is now ready. You can now sign in and continue setup.
            </p>
          </div>

          <div className="mt-10">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Proceed to Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompanyInvitationSuccessPage;
