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
    const { state, currentAction } = context;
    if (!currentAction) return;

    const delta = currentAction.payload.delta as number;
    const reason = currentAction.payload.reason as string || 'カード効果';
    
    // リソースを変更する前の値を保存
    const oldResources = state.resources;
    
    // リソースを変更
    const actualChange = state.modifyResources(delta);
    
    if (actualChange !== 0) {
      // リソース変更イベントを記録
      state.addEvent({
        type: GameEventType.ResourceChanged,
        timestamp: Date.now(),
        data: {
          oldValue: oldResources,
          newValue: state.resources,
          change: actualChange,
          reason: reason
        }
      });
    }
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
    const { state, currentAction } = context;
    if (!currentAction) return;

    const amount = currentAction.payload.amount as number;
    const purpose = currentAction.payload.purpose as string;
    
    // 現在のリソースが支払い額以上かチェック
    if (state.resources < amount) {
      // リソースが足りない場合は支払い失敗のフラグを設定
      context.metadata.paymentFailed = true;
      return;
    }
    
    // リソースを変更する前の値を保存
    const oldResources = state.resources;
    
    // リソースを減らす
    const actualChange = state.modifyResources(-amount);
    
    if (actualChange !== 0) {
      // リソース変更イベントを記録
      state.addEvent({
        type: GameEventType.ResourceChanged,
        timestamp: Date.now(),
        data: {
          oldValue: oldResources,
          newValue: state.resources,
          change: actualChange,
          reason: `支払い: ${purpose}`
        }
      });
      
      // 支払い成功のフラグを設定
      context.metadata.paymentSucceeded = true;
    }
  }
}