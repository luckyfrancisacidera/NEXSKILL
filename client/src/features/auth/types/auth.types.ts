export interface RequestPasswordResetPayload {
  email: string;
}

export interface RequestPasswordResetPinPayload {
  email: string;
}

export interface VerifyResetPinPayload {
  email: string;
  pin: string;
  newPassword: string;
  confirmPassword: string;
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

export interface AccountProfile {
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthMutationUser {
  userId?: string;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  roles?: string[];
}

export interface AuthMutationResponse {
  user?: AuthMutationUser;
}

export interface UpdateAccountProfilePayload {
  first_name?: string;
  last_name?: string;
}

export interface AuthMeResponse {
  is_authenticated?: boolean;
  user_id?: string;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  roles?: string[];
  active_company_id?: string | null;
  active_recruiter_profile_id?: string | null;
  company_ids?: string[];
  recruiter_profile_ids?: string[];
}

export interface RequestEmailChangePinPayload {
  new_email: string;
  confirm_email: string;
}

export interface VerifyEmailChangePinPayload {
  new_email: string;
  pin: string;
}

export interface FinalizeEmailChangePayload {
  new_email: string;
  pin: string;
}
