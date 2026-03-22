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

export const authService = {
  async getMe(): Promise<AuthMeResponse> {
    const response = await http.get<AuthMeResponse>("/api/auth/me");
    return response.data;
  },

  async getProfile(): Promise<AccountProfile> {
    const response = await http.get<AccountProfile>(profileEndpoint);
    return response.data;
  },

  async updateProfile(payload: UpdateAccountProfilePayload): Promise<AccountProfile> {
    const response = await http.put<AccountProfile>(profileEndpoint, payload);
    return response.data;
  },

  async requestPasswordReset(payload: RequestPasswordResetPayload) {
    const response = await http.post("/api/auth/request-password-reset", payload);
    return response.data;
  },

  async requestPasswordResetPin(payload: RequestPasswordResetPinPayload) {
    const response = await http.post("/api/auth/request-password-reset-pin", payload);
    return response.data;
  },

  async requestEmailChangePin(payload: RequestEmailChangePinPayload) {
    const response = await http.post("/api/auth/request-email-change-pin", payload);
    return response.data;
  },

  async verifyEmailChangePin(payload: VerifyEmailChangePinPayload) {
    const response = await http.post("/api/auth/verify-email-change-pin", payload);
    return response.data;
  },

  async finalizeEmailChange(payload: FinalizeEmailChangePayload) {
    const response = await http.post<AccountProfile>("/api/auth/finalize-email-change", payload);
    return response.data;
  },

  async validatePasswordResetToken(payload: ValidatePasswordResetTokenPayload) {
    const response = await http.post(
      "/api/auth/validate-password-reset-token",
      payload,
    );
    return response.data;
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const response = await http.post("/api/auth/reset-password", payload);
    return response.data;
  },

  async verifyResetPin(payload: VerifyResetPinPayload) {
    const response = await http.post("/api/auth/verify-reset-pin", payload);
    return response.data;
  },

  async changePassword(payload: ChangePasswordPayload) {
    const response = await http.post("/api/auth/change-password", payload);
    return response.data;
  },
};
