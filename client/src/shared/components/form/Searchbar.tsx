import { Search } from 'lucide-react';

import { SearchInput } from './SearchInput';

export default function Searchbar() {
  return <SearchInput ariaLabel="Search" icon={<Search className="h-4 w-4" />} placeholder="Search" />;
}
