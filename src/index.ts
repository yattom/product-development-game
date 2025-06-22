import { GameEngine } from './core/engine';
import { GameFactory } from './core/factory';
import { ActionType, GameEventType } from './rules/interfaces';

/**
 * プロジェクト・カオス ゲームコア
 * TypeScriptによる実装
 */

// エクスポート
export { GameEngine } from './core/engine';
export { GameFactory } from './core/factory';
export { Card } from './models/card';
export { Player } from './models/player';
export { GameState } from './models/gameState';
export { VictoryCondition, VictoryConditionType } from './models/victoryCondition';
export { DefeatCondition, DefeatConditionType } from './models/defeatCondition';
export * from './rules/interfaces';

/**
 * デモ実行関数
 * ゲームコアのデモンストレーションとして実行される
 */
function runDemo() {
  console.log('プロジェクト・カオス ゲームコア デモ');
  console.log('-----------------------------------');
  
  // ゲームを初期化
  const gameState = GameFactory.createBasicGameState(2);
  const gameEngine = new GameEngine(gameState, true);
  
  // イベントリスナーを設定
  gameEngine.addEventListener(GameEventType.PlayerTurnStarted, (event) => {
    console.log(`プレイヤーターン開始: ${event.data.playerName}`);
  });
  
  gameEngine.addEventListener(GameEventType.CardPlayed, (event) => {
    console.log(`カードプレイ: ${event.data.cardName}`);
  });
  
  gameEngine.addEventListener(GameEventType.VictoryAchieved, (event) => {
    console.log(`勝利達成: ${event.data.conditionDescription}`);
  });
  
  gameEngine.addEventListener(GameEventType.DefeatTriggered, (event) => {
    console.log(`敗北条件発動: ${event.data.conditionDescription}`);
  });
  
  // ゲーム開始アクションを実行
  gameEngine.executeAction({
    type: ActionType.TurnStart,
    payload: {},
    source: 'system'
  });
  
  console.log('ゲーム初期化完了');
  console.log('プレイヤー数:', gameEngine.getState().players.length);
  console.log('山札枚数:', gameEngine.getState().deck.length);
  console.log('混沌レベル:', gameEngine.getState().chaosLevel);
  console.log('リソース:', gameEngine.getState().resources);
  
  console.log('\nデモ完了');
}

// スクリプトとして直接実行された場合はデモを実行
if (require.main === module) {
  runDemo();
}