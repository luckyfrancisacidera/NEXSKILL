import { Card } from '@shared/components/data-display/Card';

interface AdminPlaceholderPageProps {
  title: string;
}

export const AdminPlaceholderPage = ({ title }: AdminPlaceholderPageProps) => (
  <Card>
    <h2 className="text-2xl font-semibold">{title}</h2>
    <p className="mt-2 text-zinc-500">Admin tools coming soon.</p>
  </Card>
);

