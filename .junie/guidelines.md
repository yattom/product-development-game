# プロジェクト・カオス 開発ガイドライン

このガイドラインは、プロジェクト・カオスの新規開発者向けに作成されました。プロジェクトの構造、テストの実行方法、スクリプトの実行方法、およびベストプラクティスについて簡潔に説明します。

## プロジェクト構造

```
src/
├── core/           # ゲームエンジンと状態管理
│   ├── engine.ts   # ゲームエンジン
│   └── factory.ts  # ゲーム状態ファクトリ
├── rules/          # ゲームルールの定義
│   ├── interfaces.ts  # ルールインターフェース
│   ├── registry.ts    # ルール登録機構
│   └── standard/      # 標準ルールセット
├── models/         # データモデル
│   ├── card.ts
│   ├── player.ts
│   ├── gameState.ts
│   ├── victoryCondition.ts
│   └── defeatCondition.ts
├── effects/        # カード効果の実装
│   └── playEffects.ts
└── utils/          # ユーティリティ関数
```

## 技術スタック

- **言語**: TypeScript
- **モジュールシステム**: CommonJS
- **テストフレームワーク**: Jest
- **リンター**: ESLint
- **ビルドツール**: TypeScript Compiler (tsc)

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発モード（変更を監視して自動コンパイル）
npm run dev
```

## スクリプトの実行方法

```bash
# ビルド
npm run build

# 開発モード（変更を監視）
npm run dev

# アプリケーションの実行
npm start

# テストの実行
npm test

# リントの実行
npm run lint

# ビルドディレクトリのクリーン
npm run clean
```

## テストの書き方と実行方法

- テストファイルは `*.test.ts` という命名規則に従います
- Jestを使用してテストを記述します
- テストの実行は `npm test` コマンドで行います

```typescript
// テストの例
import { someFunction } from './path/to/module';

describe('someFunction', () => {
  it('should do something correctly', () => {
    expect(someFunction()).toBe(expectedResult);
  });
});
```

## コーディング規約とベストプラクティス

1. **型安全性**: 常に適切な型を使用し、`any` の使用を避ける
2. **イミュータビリティ**: 状態の変更は新しいオブジェクトを返す関数で行う
3. **モジュール化**: 機能ごとに適切にモジュール化し、責務を分離する
4. **テスト駆動開発**: 新機能の追加前にテストを書く
5. **コメント**: 複雑なロジックには適切なコメントを付ける
6. **命名規則**: 
   - クラス: PascalCase
   - 関数・変数: camelCase
   - 定数: UPPER_SNAKE_CASE
   - インターフェース: IPascalCase または PascalCase

## 新機能の追加方法

1. 対応する機能のディレクトリに新しいファイルを作成
2. 適切なインターフェースを実装
3. 必要に応じてレジストリに登録
4. テストを作成
5. ドキュメントを更新

## トラブルシューティング

- **ビルドエラー**: `npm run clean` を実行してから再ビルド
- **テスト失敗**: エラーメッセージを確認し、該当するテストファイルを修正
- **型エラー**: インターフェースと実装の整合性を確認

## Junieへの特別な指示

- ドキュメント、ソースコード中のコメントなどは日本語で書きます
- チャットの返答も日本語で書きます