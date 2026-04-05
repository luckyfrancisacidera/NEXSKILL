import { useState } from 'react';
import { useConfirmation } from '@shared/hooks/useConfirmation';

interface ActivationCopy<T> {
  title: (activate: boolean, item: T) => string;
  message: (activate: boolean, item: T) => string;
}

interface UseAdminActivationActionOptions<T> {
  canManage: boolean;
  getId: (item: T) => string;
  isActive: (item: T) => boolean;
  activate: (item: T) => Promise<void>;
  deactivate: (item: T) => Promise<void>;
  copy: ActivationCopy<T>;
  onCompleted: () => void;
}

// Use to wrap admin activation and deactivation flows with a confirmation step.
export const useAdminActivationAction = <T>({
  canManage,
  getId,
  isActive,
  activate,
  deactivate,
  copy,
  onCompleted,
}: UseAdminActivationActionOptions<T>) => {
  const confirm = useConfirmation();
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  // Confirms the requested state change before running the matching mutation.
  const runAction = async (item: T) => {
    if (!canManage) {
      return;
    }

    const shouldActivate = !isActive(item);
    const confirmed = await confirm({
      title: copy.title(shouldActivate, item),
      message: copy.message(shouldActivate, item),
      confirmLabel: shouldActivate ? 'Activate' : 'Deactivate',
      accent: shouldActivate ? 'green' : 'red',
    });

    if (!confirmed) {
      return;
    }

    const id = getId(item);
    setPendingActionId(id);
    try {
      if (shouldActivate) {
        await activate(item);
      } else {
        await deactivate(item);
      }
      onCompleted();
    } finally {
      setPendingActionId(null);
    }
  };

  return { pendingActionId, runAction };
};
