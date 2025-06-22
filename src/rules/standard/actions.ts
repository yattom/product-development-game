import { ActionType, Category, GameContext, GameEventType, GameRule, RuleType } from '../interfaces';

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
   */
  apply(context: GameContext): void {
    const { state, currentCard, currentAction } = context;
    if (!currentCard || !currentAction) return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    const cardId = currentAction.payload.cardId as string;
    
    // プレイヤーの手札からカードを削除
    const removedCard = currentPlayer.removeCardFromHand(cardId);
    if (!removedCard) {
      throw new Error(`Card with id ${cardId} not found in player's hand`);
    }
    
    // カードプレイイベントを記録
    state.addEvent({
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
        effectRule.apply({
          ...context,
          metadata: {
            ...context.metadata,
            effectParams: currentCard.playEffect.params
          }
        });
      }
    }
    
    // カードを捨て札に加える
    state.discardCards([currentCard]);
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
   */
  apply(context: GameContext): void {
    const { state, currentCard, currentAction } = context;
    if (!currentCard || !currentAction) return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    const cardId = currentAction.payload.cardId as string;
    const category = currentAction.payload.category as Category;
    
    // カードがカテゴリに属しているか確認
    if (!currentCard.hasCategory(category)) {
      throw new Error(`Card ${currentCard.id} does not have category ${category}`);
    }
    
    // プレイヤーの手札からカードを削除
    const removedCard = currentPlayer.removeCardFromHand(cardId);
    if (!removedCard) {
      throw new Error(`Card with id ${cardId} not found in player's hand`);
    }
    
    // カードを仕事場に配置し、元々あったカードを取得
    const previousCard = state.placeCardInWorkplace(currentCard, category);
    
    // リソースの増減処理
    const resourceChange = currentCard.situationEffect;
    const actualChange = state.modifyResources(resourceChange);
    
    // リソース変更イベントを記録
    if (actualChange !== 0) {
      state.addEvent({
        type: GameEventType.ResourceChanged,
        timestamp: Date.now(),
        data: {
          oldValue: state.resources - actualChange,
          newValue: state.resources,
          change: actualChange,
          reason: `カード配置: ${currentCard.name}`
        }
      });
    }
    
    // カード配置イベントを記録
    state.addEvent({
      type: GameEventType.CardPlaced,
      timestamp: Date.now(),
      data: {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        playerIndex: state.currentPlayerIndex,
        cardId: currentCard.id,
        cardName: currentCard.name,
        category: category,
        previousCardId: previousCard?.id,
        previousCardName: previousCard?.name
      }
    });
    
    // 元々あったカードの処理（存在する場合）
    if (previousCard) {
      // 押し出し処理の選択をアクションのペイロードから取得
      const pushOutOption = currentAction.payload.pushOutOption as 'lane' | 'discard';
      
      if (pushOutOption === 'lane') {
        // 成果をまとめる（レーンへ移動）
        // リソースカードの場合、同数のリソーストークンを支払う
        if (previousCard.isResourceCard()) {
          const cost = previousCard.situationEffect;
          if (state.resources >= cost) {
            // リソースを支払う
            state.modifyResources(-cost);
            
            // リソース変更イベントを記録
            state.addEvent({
              type: GameEventType.ResourceChanged,
              timestamp: Date.now(),
              data: {
                oldValue: state.resources + cost,
                newValue: state.resources,
                change: -cost,
                reason: `レーン移動コスト: ${previousCard.name}`
              }
            });
            
            // カードを完成品レーンに移動
            state.moveCardToCompletionLane(previousCard);
          } else {
            // リソースが足りない場合は捨て札に
            state.discardCards([previousCard]);
          }
        } else {
          // トラブルカードや中立カードはコストなしでレーンに移動
          state.moveCardToCompletionLane(previousCard);
        }
      } else if (pushOutOption === 'discard') {
        // 押し出し（捨てる）
        // トラブルカードの場合、絶対値と同数のリソーストークンを支払う
        if (previousCard.isTroubleCard()) {
          const cost = Math.abs(previousCard.situationEffect);
          if (state.resources >= cost) {
            // リソースを支払う
            state.modifyResources(-cost);
            
            // リソース変更イベントを記録
            state.addEvent({
              type: GameEventType.ResourceChanged,
              timestamp: Date.now(),
              data: {
                oldValue: state.resources + cost,
                newValue: state.resources,
                change: -cost,
                reason: `トラブル解消コスト: ${previousCard.name}`
              }
            });
            
            // カードを捨て札に加える
            state.discardCards([previousCard]);
          } else {
            // リソースが足りない場合はレーンに移動
            state.moveCardToCompletionLane(previousCard);
          }
        } else {
          // リソースカードや中立カードは捨て札に
          state.discardCards([previousCard]);
        }
      }
    }
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
   */
  apply(context: GameContext): void {
    const { state, currentCard, currentAction } = context;
    if (!currentCard || !currentAction) return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    const cardId = currentAction.payload.cardId as string;
    
    // プレイヤーの手札からカードを削除
    const removedCard = currentPlayer.removeCardFromHand(cardId);
    if (!removedCard) {
      throw new Error(`Card with id ${cardId} not found in player's hand`);
    }
    
    // カードを捨て札に加える
    state.discardCards([currentCard]);
    
    // カード捨てイベントを記録
    state.addEvent({
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