import type { ParsedResumeProjectDto } from '@features/recruiter/types';

export interface ProjectCardProps {
  project: ParsedResumeProjectDto;
}

/**
 * Displays a parsed project entry.
 */
export const ProjectCard = ({ project }: ProjectCardProps) => (
  <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
    <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-100">{project.name || 'Untitled project'}</h4>

    {project.technologies?.length ? (
      <div className="mt-1 flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <span
            key={`${project.name}-${tech}`}
            className="rounded-md border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {tech}
          </span>
        ))}
      </div>
    ) : null}

    {project.description ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p> : null}

    {project.bullets?.length ? (
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
        {project.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    ) : null}
  </article>
);
