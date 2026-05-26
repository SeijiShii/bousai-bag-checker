// 投げ銭の決済抽象 (injectable、O35)。実 Stripe は release(実キー)。テストは mock。

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface VerifiedTip {
  paymentId: string;
  amount: number;
  userId: string | null; // ゲスト投げ銭は null
}

export interface PaymentGateway {
  /** 金額固定(円)の Checkout Session を作成。 */
  createCheckout(amountYen: number, userId: string | null): Promise<CheckoutSession>;
  /** webhook の署名を検証し、成功なら投げ銭情報を返す。失敗(改竄/不正)なら null。 */
  verifyWebhook(rawBody: string, signature: string): VerifiedTip | null;
}
