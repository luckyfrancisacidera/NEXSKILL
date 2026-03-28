/* eslint-disable react-refresh/only-export-components */
import type { ActionButtonProps } from '@shared/components/ActionButton';
import { ActionButton, actionButtonClassName } from '@shared/components/ActionButton';

type IconActionButtonProps = Omit<ActionButtonProps, 'destructive' | 'iconOnly'> & {
  variant?: 'neutral' | 'danger';
};

export const iconActionButtonClassName = (variant: 'neutral' | 'danger' = 'neutral') =>
  actionButtonClassName({
    destructive: variant === 'danger',
    iconOnly: true,
  });

export const IconActionButton = ({
  variant = 'neutral',
  ...props
}: IconActionButtonProps) => (
  <ActionButton
    destructive={variant === 'danger'}
    iconOnly
    {...props}
  />
);
