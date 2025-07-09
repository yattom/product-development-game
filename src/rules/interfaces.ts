import { Card } from '../models/card';
import { Player } from '../models/player';
import { GameState } from '../models/gameState';

/**
 * ルールの種類を定義するenum
 */
export enum RuleType {
  Setup = 'SETUP',
  TurnFlow = 'TURN_FLOW',
  ActionRule = 'ACTION_RULE',
  ResourceRule = 'RESOURCE_RULE',
  ChaosRule = 'CHAOS_RULE',
  VictoryRule = 'VICTORY_RULE',
  DefeatRule = 'DEFEAT_RULE',
  CardEffect = 'CARD_EFFECT',
}

/**
 * ゲームルールインターフェース
 * 全てのルールはこのインターフェースを実装する
 */
export interface GameRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;

  /**
   * ルールを適用する
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void;

  /**
   * 現在のコンテキストでこのルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns ルールが適用可能な場合はtrue
   */
  isApplicable(context: GameContext): boolean;
}

/**
 * ゲームコンテキスト
 * ルールの適用時に必要な情報を提供する
 */
export interface GameContext {
  state: GameState;
  currentAction?: Action;
  currentCard?: Card;
  currentPlayer?: Player;
  metadata: Record<string, any>;
}

/**
 * ルールセット
 * 複数のルールをグループ化する
 */
export interface RuleSet {
  id: string;
  name: string;
  description: string;
  rules: GameRule[];
}

/**
 * アクションの種類を定義するenum
 */
export enum ActionType {
  DrawCard = 'DRAW_CARD',
  PlayCard = 'PLAY_CARD',
  DiscardCard = 'DISCARD_CARD',
  PlaceCard = 'PLACE_CARD',
  TurnStart = 'TURN_START',
  TurnEnd = 'TURN_END',
  ModifyResources = 'MODIFY_RESOURCES',
  ModifyChaos = 'MODIFY_CHAOS',
  CheckVictory = 'CHECK_VICTORY',
  CheckDefeat = 'CHECK_DEFEAT',
  PayResources = 'PAY_RESOURCES',
}

/**
 * アクション
 * ゲーム内で実行される操作
 */
export interface Action {
  type: ActionType;
  payload: Record<string, any>;
  source?: string; // アクションの発生源（プレイヤー、カード、ルールなど）
}

/**
 * ゲームイベントの種類
 */
export enum GameEventType {
  CardDrawn = 'CARD_DRAWN',
  CardPlayed = 'CARD_PLAYED',
  CardDiscarded = 'CARD_DISCARDED',
  CardPlaced = 'CARD_PLACED',
  ResourceChanged = 'RESOURCE_CHANGED',
  ChaosChanged = 'CHAOS_CHANGED',
  PlayerTurnStarted = 'PLAYER_TURN_STARTED',
  PlayerTurnEnded = 'PLAYER_TURN_ENDED',
  GameStarted = 'GAME_STARTED',
  GameEnded = 'GAME_ENDED',
  VictoryAchieved = 'VICTORY_ACHIEVED',
  DefeatTriggered = 'DEFEAT_TRIGGERED',
}

/**
 * ゲームイベント
 * ゲーム内で発生した出来事
 */
export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data: Record<string, any>;
}

/**
 * カードのカテゴリ
 */
export enum Category {
  Technology = 'TECHNOLOGY',
  User = 'USER',
  Management = 'MANAGEMENT',
}

/**
 * プレイ効果
 */
export interface PlayEffect {
  ruleId: string;
  params: Record<string, any>;
  description: string;
}

/**
 * 勝利条件インターフェース
 */
export interface VictoryCondition {
  ruleId: string;
  params: Record<string, any>;
  description: string;
}

/**
 * 敗北条件インターフェース
 */
export interface DefeatCondition {
  ruleId: string;
  params: Record<string, any>;
  description: string;
}
