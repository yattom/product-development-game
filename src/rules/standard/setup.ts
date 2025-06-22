import { ActionType, GameContext, GameRule, RuleType } from '../interfaces';
import { Card } from '../../models/card';
import { VictoryCondition, VictoryConditionType } from '../../models/victoryCondition';
import { DefeatCondition, DefeatConditionType } from '../../models/defeatCondition';

/**
 * 標準ゲームセットアップルール
 * ゲームの初期状態を設定する
 */
export class StandardSetupRule implements GameRule {
  readonly id = 'standard-setup';
  readonly name = '標準セットアップ';
  readonly description = '標準的なゲームセットアップを行います';
  readonly type = RuleType.Setup;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns ゲーム開始時のセットアップアクションなら適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.currentAction?.type === ActionType.TurnStart && 
           context.state.eventHistory.length === 0; // 最初のターン開始時のみ適用
  }

  /**
   * ゲームの初期設定を行う
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state } = context;

    // 山札をシャッフル
    this.shuffleDeck(state.deck);

    // 各プレイヤーに手札を配る（3枚ずつ）
    state.players.forEach(player => {
      const cards = state.drawCards(3);
      cards.forEach(card => player.addCardToHand(card));
    });

    // 勝利条件と敗北条件を設定
    this.setupVictoryConditions(state);
    this.setupDefeatConditions(state);

    // 混沌レベルを0に設定
    // リソーストークンを0に設定
    // （GameStateのコンストラクタで既に0に初期化されているため、ここでは何もしない）

    // 状態のメタデータを初期化
    state.setMetadata('roundsSinceChaosModified', 0);
  }

  /**
   * 山札をシャッフルする
   * @param deck シャッフルする山札
   */
  private shuffleDeck(deck: Card[]): void {
    // ランダムに並べ替え
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  /**
   * 勝利条件を設定する
   * @param state ゲーム状態
   */
  private setupVictoryConditions(state: any): void {
    // 今回のゲームで使用する勝利条件をランダムに選択
    const victoryTypes = [
      VictoryConditionType.BalancedProduct,
      VictoryConditionType.WorldChangingInnovation,
      VictoryConditionType.FireExtinguishing
    ];
    
    const selectedType = victoryTypes[Math.floor(Math.random() * victoryTypes.length)];
    const victoryCondition = VictoryCondition.createStandard(selectedType);
    
    // 勝利条件をゲーム状態に設定
    state.victoryConditions = [victoryCondition];
  }

  /**
   * 敗北条件を設定する
   * @param state ゲーム状態
   */
  private setupDefeatConditions(state: any): void {
    // 標準の敗北条件を全て設定
    const defeatConditions = [
      DefeatCondition.createStandard(DefeatConditionType.DeckDepletion),
      DefeatCondition.createStandard(DefeatConditionType.ChaosOverflow),
      DefeatCondition.createStandard(DefeatConditionType.StagnationPenalty)
    ];
    
    // 敗北条件をゲーム状態に設定
    state.defeatConditions = defeatConditions;
  }
}