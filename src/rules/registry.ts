import { GameRule, RuleSet } from './interfaces';

/**
 * ルールレジストリクラス
 * ゲームルールを登録・管理する
 */
export class RuleRegistry {
  private rules: Map<string, GameRule>;
  private ruleSets: Map<string, RuleSet>;

  constructor() {
    this.rules = new Map<string, GameRule>();
    this.ruleSets = new Map<string, RuleSet>();
  }

  /**
   * ルールを登録する
   * @param rule 登録するルール
   * @throws 既に同じIDのルールが存在する場合はエラー
   */
  registerRule(rule: GameRule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Rule with id ${rule.id} is already registered`);
    }
    this.rules.set(rule.id, rule);
  }

  /**
   * ルールセットを登録する
   * @param ruleSet 登録するルールセット
   * @throws 既に同じIDのルールセットが存在する場合はエラー
   */
  registerRuleSet(ruleSet: RuleSet): void {
    if (this.ruleSets.has(ruleSet.id)) {
      throw new Error(`RuleSet with id ${ruleSet.id} is already registered`);
    }
    
    // ルールセット内の全てのルールが登録されているか確認
    for (const rule of ruleSet.rules) {
      if (!this.rules.has(rule.id)) {
        throw new Error(`Rule with id ${rule.id} is not registered`);
      }
    }
    
    this.ruleSets.set(ruleSet.id, ruleSet);
  }

  /**
   * ルールを取得する
   * @param ruleId 取得するルールのID
   * @returns 指定されたIDのルール
   * @throws 指定されたIDのルールが存在しない場合はエラー
   */
  getRule(ruleId: string): GameRule {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule with id ${ruleId} is not registered`);
    }
    return rule;
  }

  /**
   * ルールセットを取得する
   * @param ruleSetId 取得するルールセットのID
   * @returns 指定されたIDのルールセット
   * @throws 指定されたIDのルールセットが存在しない場合はエラー
   */
  getRuleSet(ruleSetId: string): RuleSet {
    const ruleSet = this.ruleSets.get(ruleSetId);
    if (!ruleSet) {
      throw new Error(`RuleSet with id ${ruleSetId} is not registered`);
    }
    return ruleSet;
  }

  /**
   * 登録されている全てのルールを取得する
   * @returns 登録されている全てのルール
   */
  getAllRules(): GameRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 登録されている全てのルールセットを取得する
   * @returns 登録されている全てのルールセット
   */
  getAllRuleSets(): RuleSet[] {
    return Array.from(this.ruleSets.values());
  }
  
  /**
   * ルールが登録されているか確認する
   * @param ruleId 確認するルールのID
   * @returns ルールが登録されている場合はtrue
   */
  hasRule(ruleId: string): boolean {
    return this.rules.has(ruleId);
  }
  
  /**
   * ルールセットが登録されているか確認する
   * @param ruleSetId 確認するルールセットのID
   * @returns ルールセットが登録されている場合はtrue
   */
  hasRuleSet(ruleSetId: string): boolean {
    return this.ruleSets.has(ruleSetId);
  }
}