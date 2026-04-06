import type { ParsedResumeWorkExperienceDto } from '@features/recruiter/types';

export interface WorkExperienceCardProps {
  role: ParsedResumeWorkExperienceDto;
}

/**
 * Displays a parsed work experience entry.
 */
export const WorkExperienceCard = ({ role }: WorkExperienceCardProps) => (
  <article className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-3 dark:border-zinc-700 dark:bg-zinc-900/60 sm:p-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h4 className="text-sm font-semibold text-zinc-800 capitalize dark:text-zinc-100 sm:text-base">
          {role.job_title || 'Experience'}
        </h4>
        <p className="text-[13px] text-zinc-500 capitalize dark:text-zinc-400 sm:text-sm">{role.company || 'Company not provided'}</p>
      </div>
      <span className="text-[13px] text-zinc-500 dark:text-zinc-400 sm:text-sm">
        {[role.start_date, role.end_date].filter(Boolean).join(' - ') || 'Date not available'}
      </span>
    </div>

    {role.bullets?.length ? (
      <ul className="mt-3 list-disc space-y-1 pl-6 text-[13px] text-zinc-700 dark:text-zinc-300 sm:text-sm">
        {role.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    ) : null}

    {role.technologies?.length ? (
      <div className="mt-3 flex flex-wrap gap-2">
        {role.technologies.map((tech) => (
          <span
            key={`${role.job_title}-${tech}`}
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 sm:text-xs"
          >
            {tech}
          </span>
        ))}
      </div>
    ) : null}
  </article>
);
