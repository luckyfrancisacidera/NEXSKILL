export type ProfileFormState = {
  firstName: string;
  lastName: string;
};

export type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type PasswordVisibilityState = {
  currentPassword: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
};
