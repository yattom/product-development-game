// インターフェースをインポート
import { VictoryCondition as IVictoryCondition } from '../rules/interfaces';

/**
 * 勝利条件タイプの列挙型
 */
export enum VictoryConditionType {
  /**
   * バランスの取れたプロダクト
   * 3つのカテゴリのカードが2枚ずつ、計6枚レーンにある
   */
  BalancedProduct = 'BALANCED_PRODUCT',

  /**
   * 世界を変えるイノベーション
   * 「リソース +3」のカードだけが5枚レーンにある
   */
  WorldChangingInnovation = 'WORLD_CHANGING_INNOVATION',

  /**
   * 炎上鎮火
   * 混沌ダイスの目を0にする
   */
  FireExtinguishing = 'FIRE_EXTINGUISHING',

  /**
   * カスタム勝利条件
   * パラメータに応じてカスタマイズ可能
   */
  Custom = 'CUSTOM'
}

/**
 * 勝利条件クラス
 * ゲームの勝利条件を表現する
 */
export class VictoryCondition implements IVictoryCondition {
  /** 勝利条件のルールID */
  readonly ruleId: string;

  /** 勝利条件のパラメータ */
  readonly params: Record<string, any>;

  /** 勝利条件の説明 */
  readonly description: string;

  /**
   * 勝利条件を作成する
   */
  constructor(params: {
    ruleId: string;
    params: Record<string, any>;
    description: string;
  }) {
    this.ruleId = params.ruleId;
    this.params = { ...params.params };
    this.description = params.description;
  }

  /**
   * 標準の勝利条件を作成するファクトリメソッド
   */
  static createStandard(type: VictoryConditionType, customParams?: Record<string, any>): VictoryCondition {
    switch (type) {
      case VictoryConditionType.BalancedProduct:
        return new VictoryCondition({
          ruleId: 'victory-balanced-product',
          params: {
            type: VictoryConditionType.BalancedProduct,
            categoryCount: 2 // 各カテゴリ2枚ずつ
          },
          description: 'バランスの取れたプロダクト: 3つのカテゴリのカードが2枚ずつ、計6枚レーンにある'
        });

      case VictoryConditionType.WorldChangingInnovation:
        return new VictoryCondition({
          ruleId: 'victory-world-changing-innovation',
          params: {
            type: VictoryConditionType.WorldChangingInnovation,
            resourceValue: 3, // リソース値+3のカード
            cardCount: 5 // 5枚必要
          },
          description: '世界を変えるイノベーション: 「リソース +3」のカードだけが5枚レーンにある'
        });

      case VictoryConditionType.FireExtinguishing:
        return new VictoryCondition({
          ruleId: 'victory-fire-extinguishing',
          params: {
            type: VictoryConditionType.FireExtinguishing,
            targetChaosLevel: 0 // 混沌レベル0が目標
          },
          description: '炎上鎮火: 混沌ダイスの目を0にする'
        });

      case VictoryConditionType.Custom:
        if (!customParams) {
          throw new Error('Custom victory condition requires parameters');
        }
        return new VictoryCondition({
          ruleId: 'victory-custom',
          params: {
            type: VictoryConditionType.Custom,
            ...customParams
          },
          description: customParams.description || 'カスタム勝利条件'
        });

      default:
        throw new Error(`Unknown victory condition type: ${type}`);
    }
  }
}
