import { z } from "zod";
import { FEEDBACK_TYPES } from "@/db/enums";

// 送信入力 (SEC-003)。reaction または bug 本文。enum は db/enums 由来。
export const feedbackInputSchema = z
  .object({
    type: z.enum(FEEDBACK_TYPES),
    reaction: z.enum(["up", "down"]).optional(),
    payload: z.string().max(1000).optional(), // bug 本文
  })
  // message は i18n キー (spec-review R3)。表示層で t() する。
  .refine((v) => v.type !== "reaction" || !!v.reaction, {
    message: "errors.feedbackReactionRequired",
    path: ["reaction"],
  })
  .refine((v) => v.type !== "bug" || !!v.payload, {
    message: "errors.feedbackContentRequired",
    path: ["payload"],
  });

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;
