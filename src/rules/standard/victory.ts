import { ActionType, Category, GameContext, GameEventType, GameRule, RuleType } from '../interfaces';
import { VictoryConditionType } from '../../models/victoryCondition';
import { DefeatConditionType } from '../../models/defeatCondition';
import { GameState } from '../../models/gameState';
import { Card } from '../../models/card';

/**
 * 勝利条件チェックルール
 * ゲームの勝利条件を満たしているかチェックする
 */
export class CheckVictoryRule implements GameRule {
  readonly id = 'standard-check-victory';
  readonly name = '勝利条件チェック';
  readonly description = 'ターンの終了時に勝利条件を満たしているかチェックします';
  readonly type = RuleType.VictoryRule;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns 勝利条件チェックアクションまたはターン終了アクションなら適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.currentAction?.type === ActionType.CheckVictory || 
           context.currentAction?.type === ActionType.TurnEnd;
  }

  /**
   * 勝利条件チェックを行う
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state } = context;
    const victoryConditions = state.victoryConditions;

    // 勝利条件が設定されていない場合は処理終了
    if (!victoryConditions || victoryConditions.length === 0) {
      return;
    }

    // 各勝利条件をチェック
    for (const condition of victoryConditions) {
      const conditionType = condition.params.type;

      let victoryAchieved = false;

      switch (conditionType) {
        case VictoryConditionType.BalancedProduct:
          victoryAchieved = this.checkBalancedProductVictory(state, condition.params);
          break;

        case VictoryConditionType.WorldChangingInnovation:
          victoryAchieved = this.checkWorldChangingInnovationVictory(state, condition.params);
          break;

        case VictoryConditionType.FireExtinguishing:
          victoryAchieved = this.checkFireExtinguishingVictory(state, condition.params);
          break;

        default:
          // カスタム勝利条件の場合はルールレジストリから対応するルールを取得して適用
          if (context.metadata.ruleRegistry) {
            const customRule = context.metadata.ruleRegistry.getRule(condition.ruleId);
            if (customRule) {
              const customContext = {
                ...context,
                metadata: {
                  ...context.metadata,
                  conditionParams: condition.params,
                  victoryAchieved: false
                }
              };
              customRule.apply(customContext);
              victoryAchieved = customContext.metadata.victoryAchieved || false;
            }
          }
          break;
      }

      if (victoryAchieved) {
        // 勝利条件達成イベントを記録
        state.addEventMUTING({
          type: GameEventType.VictoryAchieved,
          timestamp: Date.now(),
          data: {
            conditionType: conditionType,
            conditionDescription: condition.description
          }
        });

        // 勝利フラグをメタデータに設定
        state.setMetadataMUTING('gameOver', true);
        state.setMetadataMUTING('victoryAchieved', true);

        // 1つでも勝利条件を満たしていれば処理終了
        break;
      }
    }
  }

  /**
   * バランスの取れたプロダクト勝利条件をチェック
   * 3つのカテゴリのカードが2枚ずつ、計6枚レーンにある
   */
  private checkBalancedProductVictory(state: GameState, params: Record<string, any>): boolean {
    const completionLane = state.completionLane;
    const requiredCount = params.categoryCount || 2;

    // カテゴリごとのカード数をカウント
    const categoryCounts = {
      [Category.Technology]: 0,
      [Category.User]: 0,
      [Category.Management]: 0
    };

    for (const card of completionLane) {
      for (const category of (card as Card).categories) {
        categoryCounts[category as Category]++;
      }
    }

    // 各カテゴリが必要な枚数以上あるかチェック
    return categoryCounts[Category.Technology] >= requiredCount &&
           categoryCounts[Category.User] >= requiredCount &&
           categoryCounts[Category.Management] >= requiredCount;
  }

  /**
   * 世界を変えるイノベーション勝利条件をチェック
   * 「リソース +3」のカードだけが5枚レーンにある
   */
  private checkWorldChangingInnovationVictory(state: GameState, params: Record<string, any>): boolean {
    const completionLane = state.completionLane;
    const resourceValue = params.resourceValue || 3;
    const requiredCount = params.cardCount || 5;

    // リソース+3のカード数をカウント
    const highResourceCards = completionLane.filter((card: Card) => card.situationEffect === resourceValue);

    return highResourceCards.length >= requiredCount;
  }

  /**
   * 炎上鎮火勝利条件をチェック
   * 混沌ダイスの目を0にする
   */
  private checkFireExtinguishingVictory(state: GameState, params: Record<string, any>): boolean {
    const targetChaosLevel = params.targetChaosLevel || 0;
    return state.chaosLevel === targetChaosLevel;
  }
}

/**
 * 敗北条件チェックルール
 * ゲームの敗北条件を満たしているかチェックする
 */
export class CheckDefeatRule implements GameRule {
  readonly id = 'standard-check-defeat';
  readonly name = '敗北条件チェック';
  readonly description = 'ゲームの敗北条件を満たしているかチェックします';
  readonly type = RuleType.DefeatRule;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns 敗北条件チェックアクションまたはターン終了アクションなら適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.currentAction?.type === ActionType.CheckDefeat || 
           context.currentAction?.type === ActionType.TurnEnd;
  }

  /**
   * 敗北条件チェックを行う
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state } = context;
    const defeatConditions = state.defeatConditions;

    // 敗北条件が設定されていない場合は処理終了
    if (!defeatConditions || defeatConditions.length === 0) {
      return;
    }

    // 各敗北条件をチェック
    for (const condition of defeatConditions) {
      const conditionType = condition.params.type;

      let defeatTriggered = false;

      switch (conditionType) {
        case DefeatConditionType.DeckDepletion:
          // 山札切れの敗北条件をチェック
          defeatTriggered = state.deck.length === 0 && state.discard.length === 0;
          break;

        case DefeatConditionType.ChaosOverflow:
          // 混沌オーバーフローの敗北条件をチェック
          // この条件は混沌レベル変更ルールで既にチェックしているため、
          // ここでは既にオーバーフローイベントが記録されているかを確認
          defeatTriggered = state.eventHistory.some(
            event => event.type === GameEventType.DefeatTriggered && 
                    event.data.reason === '混沌オーバーフロー'
          );
          break;

        case DefeatConditionType.StagnationPenalty:
          // 停滞ペナルティ超過の敗北条件をチェック
          defeatTriggered = state.chaosNotModifiedForFullRound && 
                           state.chaosLevel >= 3;
          break;

        default:
          // カスタム敗北条件の場合はルールレジストリから対応するルールを取得して適用
          if (context.metadata.ruleRegistry) {
            const customRule = context.metadata.ruleRegistry.getRule(condition.ruleId);
            if (customRule) {
              const customContext = {
                ...context,
                metadata: {
                  ...context.metadata,
                  conditionParams: condition.params,
                  defeatTriggered: false
                }
              };
              customRule.apply(customContext);
              defeatTriggered = customContext.metadata.defeatTriggered || false;
            }
          }
          break;
      }

      if (defeatTriggered) {
        // 敗北条件達成イベントを記録
        state.addEventMUTING({
          type: GameEventType.DefeatTriggered,
          timestamp: Date.now(),
          data: {
            conditionType: conditionType,
            conditionDescription: condition.description
          }
        });

        // 敗北フラグをメタデータに設定
        state.setMetadataMUTING('gameOver', true);
        state.setMetadataMUTING('defeatTriggered', true);

        // 1つでも敗北条件を満たしていれば処理終了
        break;
      }
    }
  }
}
