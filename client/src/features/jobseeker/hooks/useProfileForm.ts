import { useEffect, useState, type FormEvent } from "react";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";

const initialFormState: Record<string, string> = {};

// Use to populate and submit the lightweight jobseeker profile form.
export const useProfileForm = () => {
  const [form, setForm] = useState<Record<string, string>>(initialFormState);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void jobseekerService
      .getProfile()
      .then((data) => setForm(data as Record<string, string>));
  }, []);

  // Handles profile form submission from the legacy profile editor.
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
