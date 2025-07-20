import {ActionType, Category, GameContext, GameEventType, GameRule, RuleType} from '../interfaces';
import {GameState} from '../../models/gameState';

/**
 * カードプレイルール
 * 手札からカードを使用した時の効果を処理する
 */
export class PlayCardRule implements GameRule {
  readonly id = 'standard-play-card';
  readonly name = 'カードプレイ';
  readonly description = '手札のカードを使用し、そのプレイ効果を適用します';
  readonly type = RuleType.ActionRule;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns カードプレイアクションなら適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.currentAction?.type === ActionType.PlayCard && !!context.currentCard;
  }

  /**
   * カードプレイ処理を行う
   * @param context ゲームコンテキスト
   * @returns 新しいGameState
   */
  apply(context: GameContext): GameState {
    const { state, currentCard, currentAction } = context;
    if (!currentCard || !currentAction) return state;

    const currentPlayer = state.players[state.currentPlayerIndex];
    const cardId = currentAction.payload.cardId as string;
    
    // プレイヤーの手札からカードを削除
    const { newPlayer, removedCard } = currentPlayer.removeCardFromHand(cardId);
    
    // プレイヤー配列を更新
    const updatedPlayers = [...state.players];
    updatedPlayers[state.currentPlayerIndex] = newPlayer;
    
    let currentState = state.newState({ players: updatedPlayers });

    // カードプレイイベントを記録
    currentState = currentState.addEvent({
      type: GameEventType.CardPlayed,
      timestamp: Date.now(),
      data: {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        playerIndex: state.currentPlayerIndex,
        cardId: currentCard.id,
        cardName: currentCard.name,
        cardEffect: currentCard.playEffect
      }
    });
    
    // カードのプレイ効果を適用
    if (currentCard.playEffect) {
      // プレイ効果を処理するルールを適用
      const effectRuleId = currentCard.playEffect.ruleId;
      
      // GameRuleレジストリからルールを取得して適用するロジックが必要
      // 現在はコンテキストにruleRegistryが含まれていないため、
      // 実際の実装ではエンジンクラスで処理することになる
      const effectRule = context.metadata.ruleRegistry?.getRule(effectRuleId);
      if (effectRule) {
        const effectResult = effectRule.apply({
          ...context,
          state: currentState,
          metadata: {
            ...context.metadata,
            effectParams: currentCard.playEffect.params
          }
        });
        if (effectResult) {
          currentState = effectResult;
        }
      }
    }
    
    // カードを捨て札に加える
    return currentState.discardCards([currentCard]);
  }
}

/**
 * カード配置ルール
 * 手札からカードを場に配置する処理を行う
 */
export class PlaceCardRule implements GameRule {
  readonly id = 'standard-place-card';
  readonly name = 'カード配置';
  readonly description = '手札のカードを仕事場に配置します';
  readonly type = RuleType.ActionRule;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns カード配置アクションなら適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.currentAction?.type === ActionType.PlaceCard && !!context.currentCard;
  }

  /**
   * カード配置処理を行う
   * @param context ゲームコンテキスト
   * @returns 新しいGameState
   */
  apply(context: GameContext): GameState {
    // TODO: 完全なイミュータブル実装が必要
    // 暫定的に元の状態を返す
    return context.state;
  }

  private validateInput(context: GameContext) {
    const {state, currentCard, currentAction} = context;
    // currentCardは指定してはならない。currentAction.cardIdのカードを配置する
    if (currentCard) {
      throw new Error('currentCard must not be specified for PlaceCard action');
    }

    if (!currentAction) {
      throw new Error('currentAction must be specified for PlaceCard action');
    }

    const currentPlayer = state.players[state.currentPlayerIndex];
    const cardId = currentAction.payload.cardId as string;
    const category = currentAction.payload.category as Category;
    return {state, currentAction, currentPlayer, cardId, category};
  }
}

/**
 * カード捨てルール
 * 手札からカードを捨てる処理を行う
 */
export class DiscardCardRule implements GameRule {
  readonly id = 'standard-discard-card';
  readonly name = 'カード捨て';
  readonly description = '手札のカードを捨て札に加えます';
  readonly type = RuleType.ActionRule;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns カード捨てアクションなら適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.currentAction?.type === ActionType.DiscardCard && !!context.currentCard;
  }

  /**
   * カード捨て処理を行う
   * @param context ゲームコンテキスト
   * @returns 新しいGameState
   */
  apply(context: GameContext): GameState {
    const { state, currentCard, currentAction } = context;
    if (!currentCard || !currentAction) return state;

    const currentPlayer = state.players[state.currentPlayerIndex];
    const cardId = currentAction.payload.cardId as string;
    
    // プレイヤーの手札からカードを削除
    const { newPlayer, removedCard } = currentPlayer.removeCardFromHand(cardId);
    
    // プレイヤー配列を更新
    const updatedPlayers = [...state.players];
    updatedPlayers[state.currentPlayerIndex] = newPlayer;
    
    let currentState = state.newState({ players: updatedPlayers });

    // カードを捨て札に加える
    currentState = currentState.discardCards([currentCard]);
    
    // カード捨てイベントを記録
    return currentState.addEvent({
      type: GameEventType.CardDiscarded,
      timestamp: Date.now(),
      data: {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        playerIndex: state.currentPlayerIndex,
        cardId: currentCard.id,
        cardName: currentCard.name
      }
    });
  }
}