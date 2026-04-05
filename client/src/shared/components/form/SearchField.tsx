import { SearchInput, type SearchInputProps } from './SearchInput';

type SearchFieldProps = Omit<SearchInputProps, 'wrapperClassName' | 'inputClassName' | 'ariaLabel'> & {
  label: string;
  className?: string;
};

export default function SearchField({ label, className, name, ...props }: SearchFieldProps) {
  return <SearchInput {...props} label={label} name={name} wrapperClassName={className} ariaLabel={name} />;
}
