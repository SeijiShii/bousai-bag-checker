import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import type { FeedbackInput } from './feedbackSchema';

export interface FeedbackWidgetProps {
  onSubmit: (input: FeedbackInput) => void;
}

/** 控えめな 👍/👎 + バグ報告ウィジェット (O40、非侵襲)。 */
export function FeedbackWidget({ onSubmit }: FeedbackWidgetProps) {
  const { t } = useTranslation();
  const [bugOpen, setBugOpen] = useState(false);
  const [bugText, setBugText] = useState('');
  const [done, setDone] = useState(false);

  if (done) return <p className="text-sm text-text-muted">{t('feedback.thanks')}</p>;

  return (
    <div className="flex flex-col gap-2 text-sm text-text-muted">
      <div className="flex items-center gap-2">
        <Button variant="ghost" aria-label={t('feedback.good')} onClick={() => { onSubmit({ type: 'reaction', reaction: 'up' }); setDone(true); }}>
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button variant="ghost" aria-label={t('feedback.bad')} onClick={() => { onSubmit({ type: 'reaction', reaction: 'down' }); setDone(true); }}>
          <ThumbsDown className="h-4 w-4" />
        </Button>
        <button type="button" className="underline" onClick={() => setBugOpen((v) => !v)}>
          {t('feedback.bugReport')}
        </button>
      </div>
      {bugOpen ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!bugText) return;
            onSubmit({ type: 'bug', payload: bugText });
            setDone(true);
          }}
          className="flex flex-col gap-2"
        >
          <Field label={t('feedback.bugContent')} value={bugText} onChange={(e) => setBugText(e.target.value)} />
          <Button type="submit">{t('common.send')}</Button>
        </form>
      ) : null}
    </div>
  );
}
