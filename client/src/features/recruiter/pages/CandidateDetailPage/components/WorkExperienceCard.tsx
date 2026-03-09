import type { ParsedResumeWorkExperienceDto } from '@features/recruiter/types';

export interface WorkExperienceCardProps {
  role: ParsedResumeWorkExperienceDto;
}

/**
 * Displays a parsed work experience entry.
 */
export const WorkExperienceCard = ({ role }: WorkExperienceCardProps) => (
  <article className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h4 className="text-md font-semibold text-zinc-800 capitalize">{role.job_title || 'Experience'}</h4>
        <p className="text-sm text-zinc-500 capitalize">{role.company || 'Company not provided'}</p>
      </div>
      <span className="text-sm text-zinc-500">
        {[role.start_date, role.end_date].filter(Boolean).join(' - ') || 'Date not available'}
      </span>
    </div>

    {role.bullets?.length ? (
      <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-zinc-700">
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
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-700"
          >
            {tech}
          </span>
        ))}
      </div>
    ) : null}
  </article>
);
