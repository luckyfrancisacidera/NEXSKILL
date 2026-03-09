export interface BulletListProps {
  items: string[];
  emptyLabel: string;
}

/**
 * Renders a fallback-aware bullet list for job detail sections.
 */
export const BulletList = ({ items, emptyLabel }: BulletListProps) => (
  <ul className="list-disc space-y-2 pl-5 text-zinc-700">
    {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>{emptyLabel}</li>}
  </ul>
);
