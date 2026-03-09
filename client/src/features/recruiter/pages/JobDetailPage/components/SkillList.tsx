export interface SkillListProps {
  items: string[];
  emptyLabel: string;
  roundedClassName: string;
}

/**
 * Displays a list of skills using consistent badge styling.
 */
export const SkillList = ({ items, emptyLabel, roundedClassName }: SkillListProps) => {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((skill) => (
        <span key={skill} className={`${roundedClassName} border border-zinc-300 bg-zinc-100 px-3 py-1 text-sm text-zinc-700`}>
          {skill}
        </span>
      ))}
    </div>
  );
};
