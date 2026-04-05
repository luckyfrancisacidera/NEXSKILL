import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Card } from "@shared/components/data-display/Card";
import { runViewTransition } from "@shared/utils/viewTransition";
import { AuthRouteTransition } from "@features/auth/components/AuthRouteTransition";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalDocumentPageProps = {
  title: string;
  intro: string;
  sections: LegalSection[];
  fallbackRoute?: string;
};

type NavigationState = {
  from?: string;
};

export const LegalDocumentPage = ({
  title,
  intro,
  sections,
  fallbackRoute = "/login",
}: LegalDocumentPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as NavigationState | null;

  const onBack = () => {
    const from = state?.from;

    runViewTransition(() => {
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      if (window.history.length > 1) {
        navigate(-1);
        return;
      }

      navigate(fallbackRoute, { replace: true });
    });
  };

  return (
    <div className="min-h-screen bg-zinc-800 px-4 py-6 text-zinc-100 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <AuthRouteTransition className="space-y-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-600 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-400 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <Card className="rounded-[28px] border-zinc-700 bg-zinc-900/70 p-6 text-zinc-100 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                Legal
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              <p className="mt-4 text-sm leading-7 text-zinc-300 sm:text-base">
                {intro}
              </p>
            </div>

            <div className="mt-8 space-y-8">
              {sections.map((section) => (
                <section key={section.title} className="space-y-3">
                  <h2 className="text-lg font-semibold text-white">
                    {section.title}
                  </h2>
                  <div className="space-y-3 text-sm leading-7 text-zinc-300 sm:text-base">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </Card>
        </AuthRouteTransition>
      </div>
    </div>
  );
};

