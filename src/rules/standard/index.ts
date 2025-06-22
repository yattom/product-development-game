import { RuleSet } from '../interfaces';
import { StandardSetupRule } from './setup';
import { StandardTurnStartRule, StandardTurnEndRule, StandardDrawRule } from './turnFlow';
import { PlayCardRule, PlaceCardRule, DiscardCardRule } from './actions';
import { ModifyResourcesRule, PayResourcesRule } from './resources';
import { ChaosLevel2Rule, ChaosLevel3Rule, ModifyChaosLevelRule } from './chaos';
import { CheckVictoryRule, CheckDefeatRule } from './victory';

/**
 * 標準ルールセット
 * プロジェクト・カオスの標準ルール一式
 */
export const standardRules = [
  // セットアップルール
  new StandardSetupRule(),
  
  // ターンフロールール
  new StandardTurnStartRule(),
  new StandardTurnEndRule(),
  new StandardDrawRule(),
  
  // アクションルール
  new PlayCardRule(),
  new PlaceCardRule(),
  new DiscardCardRule(),
  
  // リソースルール
  new ModifyResourcesRule(),
  new PayResourcesRule(),
  
  // 混沌ルール
  new ChaosLevel2Rule(),
  new ChaosLevel3Rule(),
  new ModifyChaosLevelRule(),
  
  // 勝利・敗北条件ルール
  new CheckVictoryRule(),
  new CheckDefeatRule()
];

/**
 * 標準ルールセット定義
 */
export const standardRuleSet: RuleSet = {
  id: 'standard',
  name: '標準ルール',
  description: 'プロジェクト・カオスの標準ルールセット',
  rules: standardRules
};