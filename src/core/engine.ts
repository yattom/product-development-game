import { 
  Action, 
  ActionType, 
  GameContext, 
  GameEvent, 
  GameEventType, 
  GameRule, 
  RuleSet 
} from '../rules/interfaces';
import { GameState } from '../models/gameState';
import { RuleRegistry } from '../rules/registry';
import { standardRuleSet, standardRules } from '../rules/standard';
import { playEffectRules } from '../effects/playEffects';

/**
 * ゲームエンジンクラス
 * ゲームの状態管理とルール適用を行う
 */
export class GameEngine {
  /** ゲームの現在の状態 */
  private state: GameState;
  
  /** ルールレジストリ */
  private ruleRegistry: RuleRegistry;
  
  /** イベントリスナー */
  private eventListeners: Map<GameEventType, ((event: GameEvent) => void)[]>;
  
  /** デバッグモード */
  private debug: boolean;

  /**
   * ゲームエンジンを作成する
   * @param initialState 初期状態（オプション）
   * @param debug デバッグモード（オプション）
   */
  constructor(initialState?: GameState, debug: boolean = false) {
    this.ruleRegistry = new RuleRegistry();
    this.registerDefaultRules();
    
    this.state = initialState || this.createInitialState();
    this.eventListeners = new Map();
    this.debug = debug;
  }

  /**
   * デフォルトのルールを登録する
   */
  private registerDefaultRules(): void {
    // 標準ルールを登録
    for (const rule of standardRules) {
      this.ruleRegistry.registerRule(rule);
    }
    
    // 標準ルールセットを登録
    this.ruleRegistry.registerRuleSet(standardRuleSet);
    
    // プレイ効果ルールを登録
    for (const [id, rule] of Object.entries(playEffectRules)) {
      this.ruleRegistry.registerRule(rule);
    }
  }

  /**
   * 初期状態を作成する
   * @returns 初期化されたゲーム状態
   */
  private createInitialState(): GameState {
    // 実際の実装では、ここでカードやプレイヤーの初期化を行う
    throw new Error('初期状態の作成が実装されていません');
  }

  /**
   * ルールを登録する
   * @param rule 登録するルール
   */
  registerRule(rule: GameRule): void {
    this.ruleRegistry.registerRule(rule);
  }

  /**
   * ルールセットを登録する
   * @param ruleSet 登録するルールセット
   */
  registerRuleSet(ruleSet: RuleSet): void {
    this.ruleRegistry.registerRuleSet(ruleSet);
  }

  /**
   * ルールセットを変更する
   * @param ruleSetId 設定するルールセットのID
   */
  setRuleSet(ruleSetId: string): void {
    const ruleSet = this.ruleRegistry.getRuleSet(ruleSetId);
    this.state.setMetadata('activeRuleSetId', ruleSet.id);
  }

  /**
   * アクションを実行する
   * @param action 実行するアクション
   * @returns 実行結果のゲーム状態
   */
  executeAction(action: Action): GameState {
    this.logDebug(`アクション実行: ${action.type}`, action.payload);
    
    // 現在のプレイヤーを取得
    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    
    // アクションに関連するカードを取得
    let currentCard = null;
    if ('cardId' in action.payload) {
      const cardId = action.payload.cardId as string;
      // アクションの種類に応じてカードを検索
      switch (action.type) {
        case ActionType.PlayCard:
        case ActionType.PlaceCard:
        case ActionType.DiscardCard:
          // プレイヤーの手札からカードを検索
          currentCard = currentPlayer.hand.find(card => card.id === cardId);
          break;
        default:
          // その他のアクションでは必要に応じてカードを検索
          break;
      }
    }
    
    // ゲームコンテキストを作成
    const context: GameContext = {
      state: this.state,
      currentAction: action,
      currentCard: currentCard || undefined,
      currentPlayer,
      metadata: {
        ruleRegistry: this.ruleRegistry
      }
    };
    
    // アクティブなルールセットを取得
    const activeRuleSetId = this.state.getMetadata<string>('activeRuleSetId') || 'standard';
    const activeRuleSet = this.ruleRegistry.getRuleSet(activeRuleSetId);
    
    // 適用可能なルールをフィルタリング
    const applicableRules = activeRuleSet.rules.filter(rule => rule.isApplicable(context));
    
    this.logDebug(`適用可能なルール: ${applicableRules.length}件`, 
      applicableRules.map(rule => rule.id));
    
    // ルールを適用
    for (const rule of applicableRules) {
      this.logDebug(`ルール適用: ${rule.id}`);
      rule.apply(context);
    }
    
    // イベントを発行
    this.state.eventHistory.forEach(event => {
      this.emitEvent(event);
    });
    
    // 更新後の状態を返す
    return this.state;
  }

  /**
   * イベントを発行する
   * @param event 発行するイベント
   */
  private emitEvent(event: GameEvent): void {
    this.logDebug(`イベント発行: ${event.type}`, event.data);
    
    // イベントタイプに対応するリスナーを取得
    const listeners = this.eventListeners.get(event.type) || [];
    
    // リスナーを呼び出す
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`イベントリスナーでエラーが発生しました: ${error}`);
      }
    });
  }

  /**
   * イベントリスナーを追加する
   * @param eventType 監視するイベントタイプ
   * @param listener 呼び出されるリスナー関数
   */
  addEventListener(eventType: GameEventType, listener: (event: GameEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * イベントリスナーを削除する
   * @param eventType 対象のイベントタイプ
   * @param listener 削除するリスナー関数
   */
  removeEventListener(eventType: GameEventType, listener: (event: GameEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      return;
    }
    
    const listeners = this.eventListeners.get(eventType)!;
    const index = listeners.indexOf(listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * 現在のゲーム状態を取得する
   * @returns 現在のゲーム状態
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * ゲームが終了したかどうかを確認する
   * @returns ゲームが終了した場合はtrue
   */
  isGameOver(): boolean {
    return this.state.getMetadata<boolean>('gameOver') || false;
  }

  /**
   * ゲームが勝利したかどうかを確認する
   * @returns 勝利した場合はtrue
   */
  isVictoryAchieved(): boolean {
    return this.state.getMetadata<boolean>('victoryAchieved') || false;
  }

  /**
   * ゲームが敗北したかどうかを確認する
   * @returns 敗北した場合はtrue
   */
  isDefeatTriggered(): boolean {
    return this.state.getMetadata<boolean>('defeatTriggered') || false;
  }

  /**
   * デバッグログを出力する
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  private logDebug(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[DEBUG] ${message}`);
      if (data !== undefined) {
        console.log(data);
      }
    }
  }
}