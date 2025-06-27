# プロジェクト・カオス

ソフトウェア開発プロジェクトで巻き起こる「修羅場、カオス、そして奇跡的な打開」を体験する、協力型のカードゲーム

## 概要

プロジェクト・カオスは、ソフトウェア開発プロジェクトで起こる様々な出来事を題材にした協力型カードゲームです。プレイヤーはプロジェクトチームの一員として、次々と発生するトラブルや幸運に一喜一憂しながら、勝利条件の達成を目指します。

## 実装状況

現在、ゲームのコアロジックが TypeScript で実装されています。このコアロジックは以下の特徴を持ちます：

- **プラグ可能なルールシステム**: 全てのゲームルールは独立したルールとして実装され、自由に組み合わせ可能
- **イベント駆動アーキテクチャ**: ゲーム内の全ての出来事はイベントとして記録され、リスナーに通知される
- **状態管理**: ゲームの状態は不変オブジェクトとして管理され、安全な操作を保証
- **拡張性**: 新しいカード、ルール、勝利条件などを簡単に追加できる設計

## ディレクトリ構造

```
src/
├── core/
│   ├── engine.ts       // ゲームエンジン
│   ├── state.ts        // 状態管理
│   ├── events.ts       // イベントシステム
│   └── actions.ts      // アクション定義
├── rules/
│   ├── interfaces.ts   // ルールインターフェース
│   ├── registry.ts     // ルール登録機構
│   ├── standard/       // 標準ルールセット
│   │   ├── setup.ts
│   │   ├── turnFlow.ts
│   │   ├── actions.ts
│   │   ├── resources.ts
│   │   ├── chaos.ts
│   │   └── victory.ts
│   └── variants/       // バリアントルール
├── models/
│   ├── card.ts
│   ├── player.ts
│   └── ruleSet.ts
├── effects/
│   └── cardEffects.ts  // カード効果実装
├── utils/
│   ├── random.ts
│   └── serialization.ts
└── index.ts            // エントリーポイント
```

## 次のステップ

1. **型エラーの修正**: インターフェースと実装クラスの不整合を解決
2. **ユニットテストの作成**: 各コンポーネントのテストを実装
3. **CLI インターフェース**: コマンドラインでゲームをプレイできるインターフェースの作成
4. **カードデータの拡充**: より多様なカードと効果の実装
5. **UI 実装**: Web または デスクトップアプリケーションとしての UI 実装

## 開発

### セットアップ

```bash
# 依存関係のインストール
npm install

# 開発モード（変更を監視して自動コンパイル）
npm run dev

# ビルド
npm run build

# テスト
npm test
```

### カスタムルールの追加方法

1. `src/rules` ディレクトリに新しいルールファイルを作成
2. `GameRule` インターフェースを実装したクラスを定義
3. `RuleRegistry` にルールを登録

```typescript
// 新しいルールの例
export class MyCustomRule implements GameRule {
  readonly id = 'my-custom-rule';
  readonly name = 'カスタムルール';
  readonly description = 'カスタムルールの説明';
  readonly type = RuleType.ActionRule;

  isApplicable(context: GameContext): boolean {
    // このルールが適用可能かどうかの条件
    return true;
  }

  apply(context: GameContext): void {
    // ルールの適用ロジック
  }
}
```

## ライセンス

MIT