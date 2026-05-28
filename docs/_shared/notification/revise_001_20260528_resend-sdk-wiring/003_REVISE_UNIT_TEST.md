# _shared/notification 単体テスト計画 (Resend SDK 実 wiring)

## 1. 追加テストケース

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| N-001 | `send` 成功 | mock resend が `{ data: {id:'...'}, error: null }` 返す | 例外なく resolve |
| N-002 | apiKey + fromAddress で factory 生成 | config | EmailSender 互換 object 返却 |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| N-101 | Resend API がエラー返却 | `{ error: { name: 'validation_error' } }` | throw (本文に PII なし、name のみ) |
| N-102 | data.to が空文字 / 不在 | `data = {}` | throw 'data.to is required' |

### 1.3 境界値
| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| N-201 | data.subject 不在 | `data = { to, html }` | subject='(no subject)' で送信 |

## 2. 修正テストケース
| なし |

## 3. 削除テストケース
| なし |

## 4. リグレッション強化
- 既存 makeNotification.test.ts (sender mock 直接 inject) は全 green 維持

## 5. Mock 方針差分
| 対象 | 前回 | 今回 | 理由 |
|---|---|---|---|
| `resend` SDK | (未使用) | `vi.mock('resend')` + vi.hoisted で `Resend` class を mock 化 | unit で実 Resend API 不可 |

## 6. カバレッジ目標
| 種別 | 目標 |
|---|---|
| 行 | 90%+ |
| 分岐 | 100% (success / error / data.to 不在の 3 分岐) |

## 7. 更新履歴
| 2026-05-28 | 初版 | /flow:revise |
