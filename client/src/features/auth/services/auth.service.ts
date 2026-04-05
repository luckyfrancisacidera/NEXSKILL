import { http } from "@shared/api/http";
import type {
  AccountProfile,
  AuthMeResponse,
  ChangePasswordPayload,
  FinalizeEmailChangePayload,
  RequestEmailChangePinPayload,
  RequestPasswordResetPayload,
  RequestPasswordResetPinPayload,
  ResetPasswordPayload,
  UpdateAccountProfilePayload,
  ValidatePasswordResetTokenPayload,
  VerifyResetPinPayload,
  VerifyEmailChangePinPayload,
} from "@features/auth/types/auth.types";

const profileEndpoint = "/api/auth/profile";

// Handles account profile, password, and email-verification API calls for auth flows.
export const authService = {
  // Use to load the authenticated user snapshot when the app restores auth state.
  async getMe(): Promise<AuthMeResponse> {
    const response = await http.get<AuthMeResponse>("/api/auth/me");
    return response.data;
  },

  // Use to fetch the account profile before rendering account settings screens.
  async getProfile(): Promise<AccountProfile> {
    const response = await http.get<AccountProfile>(profileEndpoint);
    return response.data;
  },

  // Handles account profile updates from the authenticated profile settings flow.
  async updateProfile(payload: UpdateAccountProfilePayload): Promise<AccountProfile> {
    const response = await http.put<AccountProfile>(profileEndpoint, payload);
    return response.data;
  },

  // Handles the first step of the forgot-password flow by requesting a reset email.
  async requestPasswordReset(payload: RequestPasswordResetPayload) {
    const response = await http.post("/api/auth/request-password-reset", payload);
    return response.data;
  },

  // Handles requesting a PIN-based password reset challenge for the account.
  async requestPasswordResetPin(payload: RequestPasswordResetPinPayload) {
    const response = await http.post("/api/auth/request-password-reset-pin", payload);
    return response.data;
  },

  // Handles requesting a verification PIN before an authenticated email change can continue.
  async requestEmailChangePin(payload: RequestEmailChangePinPayload) {
    const response = await http.post("/api/auth/request-email-change-pin", payload);
    return response.data;
  },

  // Handles verifying the PIN that was sent for an email change request.
  async verifyEmailChangePin(payload: VerifyEmailChangePinPayload) {
    const response = await http.post("/api/auth/verify-email-change-pin", payload);
    return response.data;
  },

  // Handles the final email change submission after the verification PIN is accepted.
  async finalizeEmailChange(payload: FinalizeEmailChangePayload) {
    const response = await http.post<AccountProfile>("/api/auth/finalize-email-change", payload);
    return response.data;
  },

  // Use to validate a reset token before the reset-password page accepts a new password.
  async validatePasswordResetToken(payload: ValidatePasswordResetTokenPayload) {
    const response = await http.post(
      "/api/auth/validate-password-reset-token",
      payload,
    );
    return response.data;
  },

  // Handles saving the new password during the reset-password completion step.
  async resetPassword(payload: ResetPasswordPayload) {
    const response = await http.post("/api/auth/reset-password", payload);
    return response.data;
  },

  // Handles verifying the reset PIN in PIN-based password recovery flows.
  async verifyResetPin(payload: VerifyResetPinPayload) {
    const response = await http.post("/api/auth/verify-reset-pin", payload);
    return response.data;
  },

  // Handles an authenticated password change from the account security settings flow.
  async changePassword(payload: ChangePasswordPayload) {
    const response = await http.post("/api/auth/change-password", payload);
    return response.data;
  },
};
