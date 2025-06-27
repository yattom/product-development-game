# プロジェクト・カオス TypeScript実装計画

## 1. プラグ可能なルールシステムのアーキテクチャ

### ルールプラグインシステム
```typescript
// ルールプラグインのインターフェース
interface GameRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  apply(context: GameContext): void;
  isApplicable(context: GameContext): boolean;
}

// ルールの種類
enum RuleType {
  Setup,           // ゲーム準備ルール
  TurnFlow,        // ターン進行ルール
  ActionRule,      // アクション実行ルール
  ResourceRule,    // リソース管理ルール
  ChaosRule,       // 混沌関連ルール
  VictoryRule,     // 勝利条件ルール
  DefeatRule,      // 敗北条件ルール
  CardEffect,      // カード効果ルール
}

// ルールコンテキスト
interface GameContext {
  state: GameState;
  currentAction?: Action;
  currentCard?: Card;
  currentPlayer?: Player;
  metadata: Record<string, any>;
}

// ルールセット
interface RuleSet {
  id: string;
  name: string;
  description: string;
  rules: GameRule[];
}
```

## 2. コアデータ構造

### カード
```typescript
interface Card {
  id: string;
  categories: Category[];
  situationEffect: number;  // -3から+3
  playEffect?: PlayEffect;
  name: string;
  description: string;
}

enum Category {
  Technology = "TECHNOLOGY",
  User = "USER",
  Management = "MANAGEMENT"
}

interface PlayEffect {
  ruleId: string;           // どのルールを適用するか指定
  params: Record<string, any>;
  description: string;
}
```

### ゲーム状態
```typescript
interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discard: Card[];
  workplaces: Record<Category, Card | null>;
  completionLane: Card[];
  chaosLevel: number;  // 0-3
  resources: number;  // 0-3
  activeRuleSet: RuleSet;
  victoryConditions: VictoryCondition[];
  defeatConditions: DefeatCondition[];
  lastChaosModifierPlayer: number | null;
  chaosNotModifiedForFullRound: boolean;
  eventHistory: GameEvent[];
  metadata: Record<string, any>;  // ルール固有のデータを格納
}

interface Player {
  id: string;
  name: string;
  hand: Card[];
  metadata: Record<string, any>;  // プレイヤー固有のデータを格納
}

interface VictoryCondition {
  ruleId: string;
  params: Record<string, any>;
  description: string;
}

interface DefeatCondition {
  ruleId: string;
  params: Record<string, any>;
  description: string;
}

interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data: Record<string, any>;
}

enum GameEventType {
  CardPlayed,
  CardDiscarded,
  CardPlaced,
  ResourceChanged,
  ChaosChanged,
  PlayerTurnStarted,
  PlayerTurnEnded,
  // その他のイベント
}
```

## 3. デフォルトルール実装

### 標準ルール実装
```typescript
// 標準ルール（デフォルトルールセット）
const standardRules: GameRule[] = [
  // セットアップルール
  {
    id: "standard-setup",
    name: "標準セットアップ",
    description: "標準的なゲームセットアップを行います",
    type: RuleType.Setup,
    apply(context) { /* 初期化ロジック */ },
    isApplicable(context) { return true; }
  },
  
  // 手札補充ルール
  {
    id: "standard-draw",
    name: "標準手札補充",
    description: "ターン終了時に手札を1枚補充します",
    type: RuleType.TurnFlow,
    apply(context) { /* 手札補充ロジック */ },
    isApplicable(context) { return context.currentAction?.type === "TurnEnd"; }
  },
  
  // 混沌レベル2の効果
  {
    id: "chaos-level-2",
    name: "混沌レベル2の効果",
    description: "カードプレイ後に山札から1枚引き、手札から1枚捨てる",
    type: RuleType.ChaosRule,
    apply(context) { /* 効果適用ロジック */ },
    isApplicable(context) {
      return context.state.chaosLevel === 2 && 
             context.currentAction?.type === "PlayCard";
    }
  },
  
  // 他のルールも同様に実装...
];

// 標準ルールセット
const standardRuleSet: RuleSet = {
  id: "standard",
  name: "標準ルール",
  description: "プロジェクト・カオスの標準ルールセット",
  rules: standardRules
};
```

## 4. ゲームエンジンの実装

```typescript
class GameEngine {
  private state: GameState;
  private ruleRegistry: Map<string, GameRule>;
  
  constructor(initialState?: Partial<GameState>) {
    this.ruleRegistry = new Map();
    this.state = this.createInitialState(initialState);
    this.registerDefaultRules();
  }
  
  // ルールの登録
  registerRule(rule: GameRule): void {
    this.ruleRegistry.set(rule.id, rule);
  }
  
  // ルールセットの変更
  setRuleSet(ruleSet: RuleSet): void {
    this.state.activeRuleSet = ruleSet;
  }
  
  // アクションの実行
  executeAction(action: Action): void {
    const context: GameContext = {
      state: this.state,
      currentAction: action,
      currentPlayer: this.state.players[this.state.currentPlayerIndex],
      metadata: {}
    };
    
    // 適用可能なルールを全て実行
    this.state.activeRuleSet.rules
      .filter(rule => rule.isApplicable(context))
      .forEach(rule => rule.apply(context));
      
    // 状態変更イベントの発行
    this.emitStateChangeEvent();
  }
  
  // その他のメソッド...
}
```

## 5. 実装順序

1. **ルールシステム基盤の構築**
   - ルールインターフェースとコンテキスト
   - ルール登録と適用のメカニズム
   - イベントシステム

2. **基本ゲームエンジンの実装**
   - 状態管理
   - アクション処理
   - ルール適用フロー

3. **標準ルールセットの実装**
   - セットアップルール
   - ターンフロールール
   - アクションルール
   - リソース管理ルール
   - 混沌ルール
   - 勝利/敗北条件ルール

4. **カードシステムの実装**
   - カードデータ構造
   - カード効果ルール
   - デッキと手札の管理

5. **ゲーム進行フローの実装**
   - プレイヤーターン管理
   - アクション実行
   - ゲーム終了条件



## 7. テスト戦略

- **ルールのユニットテスト:** 各ルールを個別にテスト
- **ルールセットの統合テスト:** ルールの組み合わせをテスト
- **ゲームフローテスト:** 完全なゲームプレイをシミュレート
- **バリアントテスト:** 異なるルールセットでのゲーム動作を検証
- **エッジケーステスト:** 極端なゲーム状態でのルール適用をテスト

## 8. カスタマイズと拡張性

1. **新規ルールの追加方法**
   - 新しいルールクラスを実装
   - ルールレジストリに登録
   - 既存または新規ルールセットに追加

2. **ルールバリアントの作成**
   - 標準ルールの一部を置換または拡張
   - 新しいルールセットとして定義
   - ゲーム開始時に適用

3. **難易度調整**
   - 特定のルールパラメータを調整
   - 勝利/敗北条件を変更するルールを追加

4. **拡張パック対応**
   - 新カテゴリ、効果、ルールを追加
   - 既存ルールとの互換性を維持