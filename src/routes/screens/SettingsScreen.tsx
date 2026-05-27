import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FeedbackWidget } from "@/features/feedback";
import { useBackend } from "@/services/backend";
import { useBackendData } from "../useBackendData";

/** 設定画面: 通知購読 (メール/先読み日数/サイレント時間) + 投げ銭 (無料・任意支援 D-028, 価格透明性 O43)。 */
export function SettingsScreen() {
  const backend = useBackend();
  const {
    data: settings,
    loading,
    reload,
  } = useBackendData(() => backend.getSettings());

  async function patch(p: Parameters<typeof backend.updateSettings>[0]) {
    await backend.updateSettings(p);
    reload();
  }

  async function handleTip() {
    const { url } = await backend.createTipCheckout();
    if (typeof window !== "undefined") window.location.assign(url);
  }

  return (
    <section aria-labelledby="settings-heading" className="flex flex-col gap-4">
      <h2 id="settings-heading" className="text-lg font-semibold text-text">
        設定
      </h2>

      {loading || !settings ? (
        <p className="text-text-muted">読み込み中…</p>
      ) : (
        <Card className="flex flex-col gap-3">
          <h3 className="text-base text-text">通知</h3>
          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={settings.emailEnabled}
              onChange={(e) => patch({ emailEnabled: e.target.checked })}
            />
            期限が近づいたらメールで知らせる
          </label>
          <Field
            label="何日前から知らせるか"
            type="number"
            min={1}
            value={settings.leadDays}
            onChange={(e) =>
              patch({ leadDays: Number(e.target.value) || settings.leadDays })
            }
          />
        </Card>
      )}

      <Card className="flex flex-col gap-2">
        <h3 className="text-base text-text">開発を応援する</h3>
        <p className="text-sm text-text-muted">
          すべての機能は無料で使えます。100
          円の投げ銭で開発を応援できます（任意・機能は変わりません）。
        </p>
        <Button onClick={handleTip}>100 円で応援する</Button>
      </Card>

      <Card className="flex flex-col gap-2">
        <h3 className="text-base text-text">ご意見・不具合</h3>
        <FeedbackWidget onSubmit={(input) => backend.submitFeedback(input)} />
      </Card>
    </section>
  );
}
