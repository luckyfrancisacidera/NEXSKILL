export interface RequestPasswordResetPayload {
  email: string;
}

export interface ValidatePasswordResetTokenPayload {
  email: string;
  token: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
