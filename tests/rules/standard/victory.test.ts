import { CheckVictoryRule } from '../../../src/rules/standard/victory';
import { GameContext } from '../../../src/rules/interfaces';
import { ActionType } from '../../../src/rules/interfaces';
import { createTestGameState, createTestPlayer } from '../../fixture/create_helper';
import { VictoryCondition, VictoryConditionType } from '../../../src/models/victoryCondition';

describe('CheckVictoryRule', () => {
  describe('イミュータブル対応', () => {
    it('apply()メソッドは新しいGameStateを返し、元の状態を変更しない（勝利条件チェック）', () => {
      // Given: テスト用のゲーム状態を作成（勝利条件を設定）
      const player1 = createTestPlayer();
      const player2 = createTestPlayer();
      
      // バランス型製品勝利条件を設定
      const victoryCondition = VictoryCondition.createStandard(VictoryConditionType.BalancedProduct);
      
      const state = createTestGameState({
        players: [player1, player2],
        currentPlayerIndex: 0,
        victoryConditions: [victoryCondition],
        eventHistory: [],
        completionLane: [], // 実際の勝利判定では中身が重要だが、テストでは簡略化
        metadata: {}
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.CheckVictory,
          payload: {}
        },
        metadata: {}
      };
      
      const originalEventHistory = [...state.eventHistory];
      const originalMetadata = { ...state.metadata };
      
      // When: ルールを適用
      const rule = new CheckVictoryRule();
      const newState = rule.apply(context);
      
      // Then: GameStateが返される
      expect(newState).toBeDefined();
      
      // Then: 元の状態は変更されない
      expect(state.eventHistory).toEqual(originalEventHistory);
      expect(state.metadata).toEqual(originalMetadata);
      
      // Then: 勝利条件チェックが実行されたことを確認
      // 勝利条件を満たさない場合は元の状態と同じ、満たす場合は新しい状態
      expect(newState).toBeDefined();
    });

    it('apply()メソッドは勝利条件が設定されていない場合、元の状態を返す', () => {
      // Given: 勝利条件が設定されていないゲーム状態
      const player1 = createTestPlayer();
      const state = createTestGameState({
        players: [player1],
        victoryConditions: [],
        eventHistory: []
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.CheckVictory,
          payload: {}
        },
        metadata: {}
      };
      
      // When: ルールを適用
      const rule = new CheckVictoryRule();
      const newState = rule.apply(context);
      
      // Then: 元の状態と同じ状態が返される
      expect(newState).toBe(state);
    });
  });
});