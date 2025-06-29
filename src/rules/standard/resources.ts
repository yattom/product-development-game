import { ActionType, GameContext, GameEventType, GameRule, RuleType } from '../interfaces';

/**
 * リソース変更ルール
 * リソーストークンを増減させるアクションを処理する
 */
export class ModifyResourcesRule implements GameRule {
  readonly id = 'standard-modify-resources';
  readonly name = 'リソース変更';
  readonly description = 'リソーストークンを増減させます';
  readonly type = RuleType.ResourceRule;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns リソース変更アクションなら適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.currentAction?.type === ActionType.ModifyResources;
  }

  /**
   * リソース変更処理を行う
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state, metadata } = context;
    const delta = metadata.effectParams?.delta as number;

    const actualChange = state.modifyResourcesMUTING(delta);

    // イベントを記録
    state.addEventMUTING({
      type: GameEventType.ResourceChanged,
      timestamp: Date.now(),
      data: {
        oldValue: state.resources - actualChange,
        newValue: state.resources,
        change: actualChange,
        reason: metadata.effectParams?.reason || 'カード効果'
      }
    });
  }
}

/**
 * リソース支払いルール
 * リソーストークンを特定の目的のために支払う
 */
export class PayResourcesRule implements GameRule {
  readonly id = 'standard-pay-resources';
  readonly name = 'リソース支払い';
  readonly description = '特定の目的のためにリソーストークンを支払います';
  readonly type = RuleType.ResourceRule;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns リソース支払いアクションなら適用可能
   */
  isApplicable(context: GameContext): boolean {
    // リソース支払いアクションの形式はここでは仮定的なもの
    // 実際の実装では、より具体的なアクションタイプが必要かもしれない
    return context.currentAction?.type === ActionType.PayResources;
  }

  /**
   * リソース支払い処理を行う
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state, metadata } = context;
    const amount = metadata.effectParams?.amount as number;

    const actualChange = state.modifyResourcesMUTING(-amount);

    // イベントを記録
    state.addEventMUTING({
      type: GameEventType.ResourceChanged,
      timestamp: Date.now(),
      data: {
        oldValue: state.resources + actualChange,
        newValue: state.resources,
        change: actualChange,
        reason: `支払い: ${metadata.effectParams?.purpose}`
      }
    });
  }
}