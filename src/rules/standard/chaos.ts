import {ActionType, GameContext, GameEventType, GameRule, RuleType} from '../interfaces';

/**
 * 混沌レベル2の効果ルール
 * 混沌レベルが2の時、カードプレイ後に山札から1枚引き、手札から1枚捨てる
 */
export class ChaosLevel2Rule implements GameRule {
  readonly id = 'standard-chaos-level-2';
  readonly name = '混沌レベル2の効果';
  readonly description = 'カードプレイ後に山札から1枚引き、手札から1枚捨てる';
  readonly type = RuleType.ChaosRule;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns 混沌レベルが2でカードをプレイした場合に適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.state.chaosLevel === 2 && 
           (context.currentAction?.type === ActionType.PlayCard ||
            context.currentAction?.type === ActionType.PlaceCard ||
            context.currentAction?.type === ActionType.DiscardCard);
  }

  /**
   * 混沌レベル2の効果を適用する
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state } = context;
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // 山札から1枚引く
    const drawnCards = state.drawCards(1);
    if (drawnCards.length === 0) {
      // 山札が空の場合は処理終了
      return;
    }
    
    const drawnCard = drawnCards[0];
    
    // 引いたカードを手札に加える
    currentPlayer.addCardToHand(drawnCard);
    
    // カードを引いたイベントを記録
    state.addEventMUTING({
      type: GameEventType.CardDrawn,
      timestamp: Date.now(),
      data: {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        playerIndex: state.currentPlayerIndex,
        cardId: drawnCard.id,
        cardName: drawnCard.name,
        reason: '混沌レベル2の効果'
      }
    });
    
    // 手札選択処理のプレースホルダー
    // 実際の実装では、ここでプレイヤーに手札から捨てるカードを選択させる必要がある
    // 現在のコンテキストでは選択ロジックが含まれていないため、仮に最初のカードを捨てる
    if (currentPlayer.getHandSize() > 0) {
      const cardToDiscard = currentPlayer.hand[0];
      const discardedCard = currentPlayer.removeCardFromHandByIndex(0);
      
      if (discardedCard) {
        // カードを捨て札に加える
        state.discardCardsMUTING([discardedCard]);
        
        // カードを捨てたイベントを記録
        state.addEventMUTING({
          type: GameEventType.CardDiscarded,
          timestamp: Date.now(),
          data: {
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            playerIndex: state.currentPlayerIndex,
            cardId: discardedCard.id,
            cardName: discardedCard.name,
            reason: '混沌レベル2の効果'
          }
        });
      }
    }
  }
}

/**
 * 混沌レベル3の効果ルール
 * 混沌レベルが3の時、カードプレイ後に山札から2枚めくり、それらを即座にプレイ
 */
export class ChaosLevel3Rule implements GameRule {
  readonly id = 'standard-chaos-level-3';
  readonly name = '混沌レベル3の効果';
  readonly description = 'カードプレイ後に山札から2枚めくり、それらを即座にプレイ';
  readonly type = RuleType.ChaosRule;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns 混沌レベルが3でカードをプレイした場合に適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.state.chaosLevel === 3 && 
           (context.currentAction?.type === ActionType.PlayCard ||
            context.currentAction?.type === ActionType.PlaceCard ||
            context.currentAction?.type === ActionType.DiscardCard) &&
           // 無限ループを防ぐためのフラグチェック
           !context.metadata.preventChaosRecursion;
  }

  /**
   * 混沌レベル3の効果を適用する
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state } = context;
    
    // 山札から2枚引く
    const drawnCards = state.drawCards(2);
    if (drawnCards.length === 0) {
      // 山札が空の場合は処理終了
      return;
    }
    
    // 引いたカードを即座にプレイ
    for (const card of drawnCards) {
      // カードを引いたイベントを記録
      state.addEventMUTING({
        type: GameEventType.CardDrawn,
        timestamp: Date.now(),
        data: {
          playerId: 'system',
          playerName: 'システム',
          cardId: card.id,
          cardName: card.name,
          reason: '混沌レベル3の効果'
        }
      });
      
      // カードのプレイ効果があれば適用
      if (card.playEffect) {
        // プレイ効果を処理するルールを適用
        const effectRuleId = card.playEffect.ruleId;
        
        // カードプレイイベントを記録
        state.addEventMUTING({
          type: GameEventType.CardPlayed,
          timestamp: Date.now(),
          data: {
            playerId: 'system',
            playerName: 'システム',
            cardId: card.id,
            cardName: card.name,
            cardEffect: card.playEffect,
            reason: '混沌レベル3の効果'
          }
        });
        
        // GameRuleレジストリからルールを取得して適用するロジックが必要
        // 無限ループを防ぐためのフラグを設定
        const effectRule = context.metadata.ruleRegistry?.getRule(effectRuleId);
        if (effectRule) {
          effectRule.apply({
            ...context,
            currentCard: card,
            metadata: {
              ...context.metadata,
              effectParams: card.playEffect.params,
              preventChaosRecursion: true // 混沌効果の再帰を防ぐ
            }
          });
        }
      }
      
      // カードを捨て札に加える
      state.discardCardsMUTING([card]);
    }
  }
}

/**
 * 混沌レベル変更ルール
 * 混沌レベルを変更するアクションを処理する
 */
export class ModifyChaosLevelRule implements GameRule {
  readonly id = 'standard-modify-chaos';
  readonly name = '混沌レベル変更';
  readonly description = '混沌レベルを増減させます';
  readonly type = RuleType.ChaosRule;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns 混沌レベル変更アクションなら適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.currentAction?.type === ActionType.ModifyChaos;
  }

  /**
   * 混沌レベル変更処理を行う
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const {state, metadata, currentAction, currentPlayer} = context;
    if (!currentAction || !currentPlayer) return;

    const delta = metadata.effectParams?.delta as number;
    const oldChaosLevel = state.chaosLevel;

    const actualChange = state.modifyChaosLevelMUTING(delta, state.currentPlayerIndex);

    // イベントを記録
    if (actualChange !== 0) {
      // 混沌レベルが変更された場合、メタデータをリセット
      state.setMetadataMUTING('roundsSinceChaosModified', 0);
      
      // 混沌レベル変更イベントを記録
      state.addEventMUTING({
        type: GameEventType.ChaosChanged,
        timestamp: Date.now(),
        data: {
          oldValue: oldChaosLevel,
          newValue: state.chaosLevel,
          change: actualChange,
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          playerIndex: state.currentPlayerIndex,
          reason: currentAction.payload.reason || 'カード効果'
        }
      });
      
      // 混沌オーバーフローのチェック
      // 混沌レベルが3の状態でさらに増やそうとした場合
      if (oldChaosLevel === 3 && delta > 0) {
        // オーバーフローイベントを記録
        state.addEventMUTING({
          type: GameEventType.DefeatTriggered,
          timestamp: Date.now(),
          data: {
            reason: '混沌オーバーフロー',
            details: '混沌レベルが3の状態でさらに増加した'
          }
        });
      }
    }
  }
}