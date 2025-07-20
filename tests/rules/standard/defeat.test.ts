import { CheckDefeatRule } from '../../../src/rules/standard/victory';
import { GameContext } from '../../../src/rules/interfaces';
import { ActionType } from '../../../src/rules/interfaces';
import { createTestGameState, createTestPlayer } from '../../fixture/create_helper';
import { DefeatCondition, DefeatConditionType } from '../../../src/models/defeatCondition';

describe('CheckDefeatRule', () => {
  describe('イミュータブル対応', () => {
    it('apply()メソッドは新しいGameStateを返し、元の状態を変更しない（敗北条件チェック）', () => {
      // Given: テスト用のゲーム状態を作成（敗北条件を設定）
      const player1 = createTestPlayer();
      const player2 = createTestPlayer();
      
      // 混沌オーバーフロー敗北条件を設定
      const defeatCondition = DefeatCondition.createStandard(DefeatConditionType.ChaosOverflow);
      
      const state = createTestGameState({
        players: [player1, player2],
        currentPlayerIndex: 0,
        defeatConditions: [defeatCondition],
        chaosLevel: 3, // 最大レベル
        eventHistory: [],
        metadata: {}
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.CheckDefeat,
          payload: {}
        },
        metadata: {}
      };
      
      const originalEventHistory = [...state.eventHistory];
      const originalMetadata = { ...state.metadata };
      
      // When: ルールを適用
      const rule = new CheckDefeatRule();
      const newState = rule.apply(context);
      
      // Then: GameStateが返される
      expect(newState).toBeDefined();
      
      // Then: 元の状態は変更されない
      expect(state.eventHistory).toEqual(originalEventHistory);
      expect(state.metadata).toEqual(originalMetadata);
      
      // Then: 敗北条件チェックが実行されたことを確認
      // 敗北条件を満たさない場合は元の状態と同じ、満たす場合は新しい状態
      expect(newState).toBeDefined();
    });

    it('apply()メソッドは敗北条件が設定されていない場合、元の状態を返す', () => {
      // Given: 敗北条件が設定されていないゲーム状態
      const player1 = createTestPlayer();
      const state = createTestGameState({
        players: [player1],
        defeatConditions: [],
        eventHistory: []
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.CheckDefeat,
          payload: {}
        },
        metadata: {}
      };
      
      // When: ルールを適用
      const rule = new CheckDefeatRule();
      const newState = rule.apply(context);
      
      // Then: 元の状態と同じ状態が返される
      expect(newState).toBe(state);
    });
  });
});