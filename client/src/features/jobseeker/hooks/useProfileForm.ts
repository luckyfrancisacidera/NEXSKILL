import { useEffect, useState, type FormEvent } from "react";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";

const initialFormState: Record<string, string> = {};

export const useProfileForm = () => {
  const [form, setForm] = useState<Record<string, string>>(initialFormState);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void jobseekerService
      .getProfile()
      .then((data) => setForm(data as Record<string, string>));
  }, []);

  const onSave = async (event: FormEvent) => {
    event.preventDefault();
    await jobseekerService.updateProfile(form);
    setMessage("Profile updated successfully.");
  };

  return {
    form,
    message,
    onSave,
    setForm,
  };
};
