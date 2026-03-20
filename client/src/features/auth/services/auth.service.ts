import { http } from "@shared/api/http";
import type {
  ChangePasswordPayload,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
  ValidatePasswordResetTokenPayload,
} from "@features/auth/types/auth.types";

export const authService = {
  async requestPasswordReset(payload: RequestPasswordResetPayload) {
    const response = await http.post("/api/auth/request-password-reset", payload);
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

  async changePassword(payload: ChangePasswordPayload) {
    const response = await http.post("/api/auth/change-password", payload);
    return response.data;
  },
};
