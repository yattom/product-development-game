// インターフェースをインポート
import { DefeatCondition as IDefeatCondition } from '../rules/interfaces';

/**
 * 敗北条件タイプの列挙型
 */
export enum DefeatConditionType {
  /**
   * 山札切れ
   * ターンの最後に山札からカードを補充できなくなった
   */
  DeckDepletion = 'DECK_DEPLETION',

  /**
   * 混沌オーバーフロー
   * 混沌ダイスが「3」の状態で、さらにダイスを増やす効果が発動した
   */
  ChaosOverflow = 'CHAOS_OVERFLOW',

  /**
   * 停滞ペナルティ超過
   * 「停滞ペナルティ」により、混沌ダイスの目が3から+1された
   */
  StagnationPenalty = 'STAGNATION_PENALTY',

  /**
   * カスタム敗北条件
   * パラメータに応じてカスタマイズ可能
   */
  Custom = 'CUSTOM'
}

/**
 * 敗北条件クラス
 * ゲームの敗北条件を表現する
 */
export class DefeatCondition implements IDefeatCondition {
  /** 敗北条件のルールID */
  readonly ruleId: string;

  /** 敗北条件のパラメータ */
  readonly params: Record<string, any>;

  /** 敗北条件の説明 */
  readonly description: string;

  /**
   * 敗北条件を作成する
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
   * 標準の敗北条件を作成するファクトリメソッド
   */
  static createStandard(type: DefeatConditionType, customParams?: Record<string, any>): DefeatCondition {
    switch (type) {
      case DefeatConditionType.DeckDepletion:
        return new DefeatCondition({
          ruleId: 'defeat-deck-depletion',
          params: {
            type: DefeatConditionType.DeckDepletion
          },
          description: '山札切れ: ターンの最後に山札からカードを補充できなくなった'
        });

      case DefeatConditionType.ChaosOverflow:
        return new DefeatCondition({
          ruleId: 'defeat-chaos-overflow',
          params: {
            type: DefeatConditionType.ChaosOverflow,
            maxChaosLevel: 3
          },
          description: '混沌オーバーフロー: 混沌ダイスが「3」の状態で、さらにダイスを増やす効果が発動した'
        });

      case DefeatConditionType.StagnationPenalty:
        return new DefeatCondition({
          ruleId: 'defeat-stagnation-penalty',
          params: {
            type: DefeatConditionType.StagnationPenalty,
            maxChaosLevel: 3
          },
          description: '停滞ペナルティ超過: 「停滞ペナルティ」により、混沌ダイスの目が3から+1された'
        });

      case DefeatConditionType.Custom:
        if (!customParams) {
          throw new Error('Custom defeat condition requires parameters');
        }
        return new DefeatCondition({
          ruleId: 'defeat-custom',
          params: {
            type: DefeatConditionType.Custom,
            ...customParams
          },
          description: customParams.description || 'カスタム敗北条件'
        });

      default:
        throw new Error(`Unknown defeat condition type: ${type}`);
    }
  }
}
