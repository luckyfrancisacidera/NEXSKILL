import { SearchInput } from '@shared/components/form';

type SearchFieldProps = {
  id?: string;
  ariaLabel: string;
  className?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  value?: string;
};

export const SearchField = ({ id, ariaLabel, className, defaultValue, onChange, placeholder, value }: SearchFieldProps) => (
  <SearchInput
    id={id}
    ariaLabel={ariaLabel}
    inputClassName={className}
    defaultValue={defaultValue}
    placeholder={placeholder}
    value={value}
    onValueChange={onChange}
  />
);
