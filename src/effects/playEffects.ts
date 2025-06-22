import { ActionType, GameContext, GameRule, RuleType } from '../rules/interfaces';

/**
 * リソース加算効果ルール
 * リソースを増加させる効果を処理する
 */
export class AddResourcesEffectRule implements GameRule {
  readonly id = 'effect-add-resources';
  readonly name = 'リソース加算効果';
  readonly description = 'リソーストークンを指定された量だけ増加させます';
  readonly type = RuleType.CardEffect;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns 効果パラメータが正しく設定されていれば適用可能
   */
  isApplicable(context: GameContext): boolean {
    return !!context.metadata.effectParams && 
           typeof context.metadata.effectParams.amount === 'number';
  }

  /**
   * リソース加算効果を適用する
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state, currentCard } = context;
    const amount = context.metadata.effectParams.amount as number;
    
    if (amount <= 0) return;
    
    // リソース変更アクションを生成
    const action = {
      type: ActionType.ModifyResources,
      payload: {
        delta: amount,
        reason: `カード効果: ${currentCard?.name || '不明'}`
      },
      source: 'card-effect'
    };
    
    // リソース変更アクションを処理するルールを適用
    const resourceRule = context.metadata.ruleRegistry?.getRule('standard-modify-resources');
    if (resourceRule) {
      resourceRule.apply({
        ...context,
        currentAction: action
      });
    }
  }
}

/**
 * リソース減算効果ルール
 * リソースを減少させる効果を処理する
 */
export class RemoveResourcesEffectRule implements GameRule {
  readonly id = 'effect-remove-resources';
  readonly name = 'リソース減算効果';
  readonly description = 'リソーストークンを指定された量だけ減少させます';
  readonly type = RuleType.CardEffect;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns 効果パラメータが正しく設定されていれば適用可能
   */
  isApplicable(context: GameContext): boolean {
    return !!context.metadata.effectParams && 
           typeof context.metadata.effectParams.amount === 'number';
  }

  /**
   * リソース減算効果を適用する
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state, currentCard } = context;
    const amount = context.metadata.effectParams.amount as number;
    
    if (amount <= 0) return;
    
    // リソース変更アクションを生成
    const action = {
      type: ActionType.ModifyResources,
      payload: {
        delta: -amount,
        reason: `カード効果: ${currentCard?.name || '不明'}`
      },
      source: 'card-effect'
    };
    
    // リソース変更アクションを処理するルールを適用
    const resourceRule = context.metadata.ruleRegistry?.getRule('standard-modify-resources');
    if (resourceRule) {
      resourceRule.apply({
        ...context,
        currentAction: action
      });
    }
  }
}

/**
 * 混沌レベル増加効果ルール
 * 混沌レベルを増加させる効果を処理する
 */
export class IncreaseChaosEffectRule implements GameRule {
  readonly id = 'effect-increase-chaos';
  readonly name = '混沌レベル増加効果';
  readonly description = '混沌ダイスの目を指定された量だけ増加させます';
  readonly type = RuleType.CardEffect;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns 効果パラメータが正しく設定されていれば適用可能
   */
  isApplicable(context: GameContext): boolean {
    return !!context.metadata.effectParams && 
           typeof context.metadata.effectParams.amount === 'number';
  }

  /**
   * 混沌レベル増加効果を適用する
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state, currentCard } = context;
    const amount = context.metadata.effectParams.amount as number;
    
    if (amount <= 0) return;
    
    // 混沌レベル変更アクションを生成
    const action = {
      type: ActionType.ModifyChaos,
      payload: {
        delta: amount,
        reason: `カード効果: ${currentCard?.name || '不明'}`
      },
      source: 'card-effect'
    };
    
    // 混沌レベル変更アクションを処理するルールを適用
    const chaosRule = context.metadata.ruleRegistry?.getRule('standard-modify-chaos');
    if (chaosRule) {
      chaosRule.apply({
        ...context,
        currentAction: action
      });
    }
  }
}

/**
 * 混沌レベル減少効果ルール
 * 混沌レベルを減少させる効果を処理する
 */
export class DecreaseChaosEffectRule implements GameRule {
  readonly id = 'effect-decrease-chaos';
  readonly name = '混沌レベル減少効果';
  readonly description = '混沌ダイスの目を指定された量だけ減少させます';
  readonly type = RuleType.CardEffect;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns 効果パラメータが正しく設定されていれば適用可能
   */
  isApplicable(context: GameContext): boolean {
    return !!context.metadata.effectParams && 
           typeof context.metadata.effectParams.amount === 'number';
  }

  /**
   * 混沌レベル減少効果を適用する
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state, currentCard } = context;
    const amount = context.metadata.effectParams.amount as number;
    
    if (amount <= 0) return;
    
    // 混沌レベル変更アクションを生成
    const action = {
      type: ActionType.ModifyChaos,
      payload: {
        delta: -amount,
        reason: `カード効果: ${currentCard?.name || '不明'}`
      },
      source: 'card-effect'
    };
    
    // 混沌レベル変更アクションを処理するルールを適用
    const chaosRule = context.metadata.ruleRegistry?.getRule('standard-modify-chaos');
    if (chaosRule) {
      chaosRule.apply({
        ...context,
        currentAction: action
      });
    }
  }
}

/**
 * カード引き効果ルール
 * 山札からカードを引く効果を処理する
 */
export class DrawCardsEffectRule implements GameRule {
  readonly id = 'effect-draw-cards';
  readonly name = 'カード引き効果';
  readonly description = '山札から指定された枚数のカードを引きます';
  readonly type = RuleType.CardEffect;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns 効果パラメータが正しく設定されていれば適用可能
   */
  isApplicable(context: GameContext): boolean {
    return !!context.metadata.effectParams && 
           typeof context.metadata.effectParams.count === 'number';
  }

  /**
   * カード引き効果を適用する
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state, currentCard } = context;
    const count = context.metadata.effectParams.count as number;
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    if (count <= 0) return;
    
    // 山札からカードを引く
    const drawnCards = state.drawCards(count);
    
    // 引いたカードを手札に加える
    drawnCards.forEach(card => {
      currentPlayer.addCardToHand(card);
      
      // カードを引いたイベントを記録
      // 実際のイベント記録はGameStateクラス内で行われるが、ここでは例示
    });
  }
}

/**
 * プレイ効果ルールのマップ
 * 効果IDとルールクラスのマッピング
 */
export const playEffectRules = {
  'effect-add-resources': new AddResourcesEffectRule(),
  'effect-remove-resources': new RemoveResourcesEffectRule(),
  'effect-increase-chaos': new IncreaseChaosEffectRule(),
  'effect-decrease-chaos': new DecreaseChaosEffectRule(),
  'effect-draw-cards': new DrawCardsEffectRule(),
};