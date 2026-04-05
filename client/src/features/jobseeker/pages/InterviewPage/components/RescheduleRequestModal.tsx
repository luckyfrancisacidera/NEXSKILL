import { SideDrawer } from "@shared/components/overlay/SideDrawer";
import { RescheduleRequestForm } from "./RescheduleRequestForm";

interface RescheduleRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (message: string, attachment?: File) => Promise<void> | void;
}

export const RescheduleRequestModal = ({
  open,
  onClose,
  onSubmit,
}: RescheduleRequestModalProps) => {
  if (!open) return null;

  return (
    <SideDrawer
      open={open}
      title="Request reschedule"
      description="Let the recruiter know why you'd like to move this interview."
      onClose={onClose}
      widthClassName="sm:max-w-[420px]"
      contentClassName="px-5 py-5"
    >
      <RescheduleRequestForm onSubmit={onSubmit} onCancel={onClose} />
    </SideDrawer>
  );
};

