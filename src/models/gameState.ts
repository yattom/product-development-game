import {Category, GameEvent, RuleSet} from '../rules/interfaces';
import {VictoryCondition} from './victoryCondition';
import {DefeatCondition} from './defeatCondition';
import {Card} from './card';
import {Player} from './player';

/**
 * ゲーム状態クラス
 * ゲームの現在の状態を表現する
 */
export class GameState {
  /** プレイヤーリスト */
  private _players: Player[];

  /** 現在のプレイヤーのインデックス */
  private _currentPlayerIndex: number;

  /** 山札 */
  private _deck: Card[];

  /** 捨て札 */
  private _discard: Card[];

  /** 仕事場（カテゴリごとに1枚のカード） */
  private _workplaces: Record<Category, Card | null>;

  /** 完成品レーン（勝利条件を達成するためのカード） */
  private _completionLane: Card[];

  /** 混沌レベル（0-3） */
  private _chaosLevel: number;

  /** リソーストークン（0-3） */
  private _resources: number;

  /** アクティブなルールセット */
  private _activeRuleSet: RuleSet;

  /** 勝利条件リスト */
  private _victoryConditions: VictoryCondition[];

  /** 敗北条件リスト */
  private _defeatConditions: DefeatCondition[];

  /** 最後に混沌レベルを変更したプレイヤーのインデックス */
  private _lastChaosModifierPlayer: number | null;

  /** 1ラウンドの間に混沌レベルが変更されなかったかどうか */
  private _chaosNotModifiedForFullRound: boolean;

  /** ゲームイベント履歴 */
  private _eventHistory: GameEvent[];

  /** ゲーム状態のメタデータ */
  private _metadata: Record<string, any>;

  /**
   * ゲーム状態を作成する
   */
  constructor(params: {
    players: Player[];
    currentPlayerIndex?: number;
    deck: Card[];
    discard?: Card[];
    workplaces?: Partial<Record<Category, Card | null>>;
    completionLane?: Card[];
    chaosLevel?: number;
    resources?: number;
    activeRuleSet: RuleSet;
    victoryConditions: VictoryCondition[];
    defeatConditions: DefeatCondition[];
    lastChaosModifierPlayer?: number | null;
    chaosNotModifiedForFullRound?: boolean;
    eventHistory?: GameEvent[];
    metadata?: Record<string, any>;
  }) {
    this._players = [...params.players];
    this._currentPlayerIndex = params.currentPlayerIndex ?? 0;
    this._deck = [...params.deck];
    this._discard = params.discard ? [...params.discard] : [];

    // 仕事場の初期化
    this._workplaces = {
      [Category.Technology]: null,
      [Category.User]: null,
      [Category.Management]: null,
      ...params.workplaces
    };

    this._completionLane = params.completionLane ? [...params.completionLane] : [];
    this._chaosLevel = params.chaosLevel ?? 0;
    this._resources = params.resources ?? 0;
    this._activeRuleSet = params.activeRuleSet;
    this._victoryConditions = [...params.victoryConditions];
    this._defeatConditions = [...params.defeatConditions];
    this._lastChaosModifierPlayer = params.lastChaosModifierPlayer ?? null;
    this._chaosNotModifiedForFullRound = params.chaosNotModifiedForFullRound ?? false;
    this._eventHistory = params.eventHistory ? [...params.eventHistory] : [];
    this._metadata = params.metadata ? { ...params.metadata } : {};

    // 値の範囲検証
    this.validateState();
  }

  /**
   * 状態の値が有効範囲内かを検証する
   */
  private validateState(): void {
    if (this._currentPlayerIndex < 0 || this._currentPlayerIndex >= this._players.length) {
      throw new Error(`Invalid currentPlayerIndex: ${this._currentPlayerIndex}`);
    }

    if (this._chaosLevel < 0 || this._chaosLevel > 3) {
      throw new Error(`Invalid chaosLevel: ${this._chaosLevel}. Must be between 0 and 3.`);
    }

    if (this._resources < 0 || this._resources > 3) {
      throw new Error(`Invalid resources: ${this._resources}. Must be between 0 and 3.`);
    }
  }

  // ゲッター

  get players(): Player[] {
    return [...this._players];
  }

  get currentPlayerIndex(): number {
    return this._currentPlayerIndex;
  }

  get currentPlayer(): Player {
    return this._players[this._currentPlayerIndex];
  }

  get deck(): Card[] {
    return [...this._deck];
  }

  get discard(): Card[] {
    return [...this._discard];
  }

  get workplaces(): Record<Category, Card | null> {
    return {
      [Category.Technology]: this._workplaces[Category.Technology],
      [Category.User]: this._workplaces[Category.User],
      [Category.Management]: this._workplaces[Category.Management]
    };
  }

  get completionLane(): Card[] {
    return [...this._completionLane];
  }

  get chaosLevel(): number {
    return this._chaosLevel;
  }

  get resources(): number {
    return this._resources;
  }

  get activeRuleSet(): RuleSet {
    return this._activeRuleSet;
  }

  get victoryConditions(): VictoryCondition[] {
    return [...this._victoryConditions];
  }

  get defeatConditions(): DefeatCondition[] {
    return [...this._defeatConditions];
  }

  get lastChaosModifierPlayer(): number | null {
    return this._lastChaosModifierPlayer;
  }

  get chaosNotModifiedForFullRound(): boolean {
    return this._chaosNotModifiedForFullRound;
  }

  get eventHistory(): GameEvent[] {
    return [...this._eventHistory];
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  // セッター＆メソッド

  /**
   * 次のプレイヤーに順番を移す
   * @returns 新しい現在プレイヤーのインデックス
   */
  moveToNextPlayerMUTING(): number {
    this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._players.length;
    return this._currentPlayerIndex;
  }

  /**
   * 現在のGameStateから、指定した差分だけを上書きした新しいGameStateを返す（イミュータブル）
   * @param updates 差分となるプロパティ群
   * @returns 新しいGameStateインスタンス
   */
  newState(updates: Partial<ConstructorParameters<typeof GameState>[0]>): GameState {
    return new GameState({
      players: this._players,
      currentPlayerIndex: this._currentPlayerIndex,
      deck: this._deck,
      discard: this._discard,
      workplaces: this._workplaces,
      completionLane: this._completionLane,
      chaosLevel: this._chaosLevel,
      resources: this._resources,
      activeRuleSet: this._activeRuleSet,
      victoryConditions: this._victoryConditions,
      defeatConditions: this._defeatConditions,
      lastChaosModifierPlayer: this._lastChaosModifierPlayer,
      chaosNotModifiedForFullRound: this._chaosNotModifiedForFullRound,
      eventHistory: this._eventHistory,
      metadata: this._metadata,
      ...updates,
    });
  }

  /**
   * 次のプレイヤーに順番を移す（イミュータブル版・一時的にmoveToNextPlayerXXXという名前で追加）
   * @returns 新しいGameStateインスタンス
   */
  moveToNextPlayer(): GameState {
    const nextIndex = (this._currentPlayerIndex + 1) % this._players.length;
    return this.newState({currentPlayerIndex: nextIndex});
  }

  /**
   * 山札からカードを引く（ミュータブル版）
   * @param count 引くカードの枚数
   * @returns 引いたカードの配列
   */
  drawCardsMUTING(count: number): Card[] {
    if (count <= 0) {
      return [];
    }

    const drawnCards: Card[] = [];

    for (let i = 0; i < count; i++) {
      if (this._deck.length === 0) {
        // 山札が尽きた場合、必要に応じて捨て札を山札に戻す
        if (this._discard.length === 0) {
          break; // 捨て札もない場合は終了
        }

        // 捨て札をシャッフルして山札にする
        this._deck = this.shuffle([...this._discard]);
        this._discard = [];
      }

      // カードを1枚引く
      const card = this._deck.pop()!;
      drawnCards.push(card);
    }

    return drawnCards;
  }

  /**
   * 山札からカードを引く（イミュータブル版）
   * @param count 引くカードの枚数
   * @returns 引いたカードと新しいGameState
   */
  drawCards(count: number): { drawnCards: Card[], state: GameState } {
    if (count <= 0) {
      return { drawnCards: [], state: this };
    }

    const drawnCards: Card[] = [];
    let deck = [...this._deck];
    let discard = [...this._discard];

    for (let i = 0; i < count; i++) {
      if (deck.length === 0) {
        // 山札が尽きた場合、必要に応じて捨て札を山札に戻す
        if (discard.length === 0) {
          break; // 捨て札もない場合は終了
        }

        // 捨て札をシャッフルして山札にする
        deck = this.shuffle([...discard]);
        discard = [];
      }

      // カードを1枚引く
      const card = deck.pop()!;
      drawnCards.push(card);
    }

    return {
      drawnCards,
      state: this.newState({ deck, discard })
    };
  }

  /**
   * カードを捨て札に加える
   * @param cards 捨て札に加えるカード
   */
  discardCardsMUTING(cards: Card[]): void {
    this._discard.push(...cards);
  }

  /**
   * カードを捨て札に加える（イミュータブル版）
   * @param cards 捨て札に加えるカード
   * @returns 新しいGameStateインスタンス
   */
  discardCards(cards: Card[]): GameState {
    return this.newState({discard: [...this._discard, ...cards]});
  }

  /**
   * 配列をシャッフルする
   * @param array シャッフルする配列
   * @returns シャッフルされた新しい配列
   */
  private shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  /**
   * カードを仕事場に配置する
   * @param card 配置するカード
   * @param category 配置するカテゴリ
   * @returns 元々あったカード（あれば）
   */
  placeCardInWorkplaceMUTING(card: Card, category: Category): Card | null {
    if (!card.hasCategory(category)) {
      throw new Error(`Card ${card.id} does not have category ${category}`);
    }

    const previousCard = this._workplaces[category];
    this._workplaces[category] = card;
    return previousCard;
  }

  /**
   * カードを仕事場に配置する
   * @param card 配置するカード
   * @param category 配置するカテゴリ
   * @returns 更新されたGameState
   */
  placeCardInWorkplace(card: Card, category: Category): { previousCard: Card | null, state: GameState } {
    if (!card.hasCategory(category)) {
      throw new Error(`Card ${card.id} does not have category ${category}`);
    }

    const previousCard = this._workplaces[category];
    const workplaces = {...this._workplaces}
    workplaces[category] = card;
    return {previousCard, state: this.newState({workplaces})};
  }

  /**
   * カードを完成品レーンに移動する
   * @param card 移動するカード
   */
  moveCardToCompletionLaneMUTING(card: Card): void {
    this._completionLane.push(card);
  }

  /**
   * カードを完成品レーンに移動する（イミュータブル版）
   * @param card 移動するカード
   * @returns 新しいGameStateインスタンス
   */
  moveCardToCompletionLane(card: Card): GameState {
    return this.newState({completionLane: [...this._completionLane, card]});
  }

  /**
   * リソースを変更する
   * @param delta 変更量（正の値で増加、負の値で減少）
   * @returns 実際に変更された量
   */
  modifyResourcesMUTING(delta: number): number {
    const oldResources = this._resources;
    this._resources = Math.max(0, Math.min(3, this._resources + delta));
    return this._resources - oldResources;
  }

  /**
   * リソースを変更する（イミュータブル版）
   * @param delta 変更量（正の値で増加、負の値で減少）
   * @returns 新しいGameStateインスタンス
   */
  modifyResources(delta: number): GameState {
    const newResources = Math.max(0, Math.min(3, this._resources + delta));
    return this.newState({resources: newResources});
  }

  /**
   * 混沌レベルを変更する
   * @param delta 変更量（正の値で増加、負の値で減少）
   * @param playerIndex 変更したプレイヤーのインデックス
   * @returns 実際に変更された量
   */
  modifyChaosLevelMUTING(delta: number, playerIndex: number): number {
    const oldChaosLevel = this._chaosLevel;
    this._chaosLevel = Math.max(0, Math.min(3, this._chaosLevel + delta));

    if (delta !== 0) {
      this._lastChaosModifierPlayer = playerIndex;
      this._chaosNotModifiedForFullRound = false;
    }

    return this._chaosLevel - oldChaosLevel;
  }

  /**
   * 混沌レベルを変更する（イミュータブル版）
   * @param delta 変更量（正の値で増加、負の値で減少）
   * @param playerIndex 変更したプレイヤーのインデックス
   * @returns 新しいGameStateインスタンス
   */
  modifyChaosLevel(delta: number, playerIndex: number): GameState {
    const newChaosLevel = Math.max(0, Math.min(3, this._chaosLevel + delta));

    const updates: Partial<ConstructorParameters<typeof GameState>[0]> = {
      chaosLevel: newChaosLevel,
    };

    if (delta !== 0) {
      updates.lastChaosModifierPlayer = playerIndex;
      updates.chaosNotModifiedForFullRound = false;
    }

    return this.newState(updates);
  }

  /**
   * 1ラウンドの間に混沌レベルが変更されなかったフラグを設定する
   */
  setChaosNotModifiedForFullRound(value: boolean): GameState {
    return this.newState({chaosNotModifiedForFullRound: value});
  }

  /**
   * イベントを履歴に追加する
   * @param event 追加するイベント
   */
  addEventMUTING(event: GameEvent): void {
    this._eventHistory.push(event);
  }

  /**
   * イベントを履歴に追加する
   * @param event 追加するイベント
   */
  addEvent(event: GameEvent): GameState {
    return this.newState({eventHistory: [...this._eventHistory, event]});
  }

  /**
   * メタデータを設定する
   * @param key メタデータのキー
   * @param value メタデータの値
   */
  setMetadataMUTING(key: string, value: any): void {
    this._metadata[key] = value;
  }

  /**
   * メタデータを設定する
   * @param key メタデータのキー
   * @param value メタデータの値
   */
  setMetadata(key: string, value: any): GameState {
    const newMetadata = { ...this._metadata, [key]: value };
    return this.newState({ metadata: newMetadata });
  }

  /**
   * メタデータを取得する
   * @param key メタデータのキー
   * @returns メタデータの値
   */
  getMetadata<T>(key: string): T | undefined {
    return this._metadata[key] as T | undefined;
  }

  /**
   * 勝利条件を設定する
   * @param conditions 設定する勝利条件の配列
   */
  setVictoryConditionsMUTING(conditions: VictoryCondition[]): void {
    this._victoryConditions = [...conditions];
  }

  /**
   * 勝利条件を設定する（イミュータブル版）
   * @param conditions 設定する勝利条件の配列
   * @returns 新しいGameStateインスタンス
   */
  setVictoryConditions(conditions: VictoryCondition[]): GameState {
    return this.newState({victoryConditions: [...conditions]});
  }

  /**
   * 敗北条件を設定する
   * @param conditions 設定する敗北条件の配列
   */
  setDefeatConditionsMUTING(conditions: DefeatCondition[]): void {
    this._defeatConditions = [...conditions];
  }

  /**
   * 敗北条件を設定する（イミュータブル版）
   * @param conditions 設定する敗北条件の配列
   * @returns 新しいGameStateインスタンス
   */
  setDefeatConditions(conditions: DefeatCondition[]): GameState {
    return this.newState({defeatConditions: [...conditions]});
  }

  /**
   * 現在のプレイヤーインデックスを設定する（イミュータブル版）
   * @param index 設定するインデックス
   * @returns 新しいGameStateインスタンス
   */
  setCurrentPlayerIndex(index: number): GameState {
    if (index < 0 || index >= this._players.length) {
      throw new Error(`Invalid player index: ${index}`);
    }
    return this.newState({currentPlayerIndex: index});
  }
}
