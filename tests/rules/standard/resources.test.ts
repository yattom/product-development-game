import { ModifyResourcesRule } from '../../../src/rules/standard/resources';
import { GameContext } from '../../../src/rules/interfaces';
import { ActionType } from '../../../src/rules/interfaces';
import { createTestGameState, createTestPlayer } from '../../fixture/create_helper';

describe('ModifyResourcesRule', () => {
  describe('イミュータブル対応', () => {
    it('apply()メソッドは新しいGameStateを返し、元の状態を変更しない', () => {
      // Given: テスト用のゲーム状態を作成
      const player1 = createTestPlayer();
      const player2 = createTestPlayer();
      
      const state = createTestGameState({
        players: [player1, player2],
        currentPlayerIndex: 0,
        resources: 1,
        eventHistory: []
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.ModifyResources,
          payload: {}
        },
        metadata: {
          effectParams: {
            delta: 2,
            reason: 'テスト効果'
          }
        }
      };
      
      const originalResources = state.resources;
      const originalEventHistory = [...state.eventHistory];
      
      // When: ルールを適用
      const rule = new ModifyResourcesRule();
      const newState = rule.apply(context);
      
      // Then: 新しいGameStateが返される
      expect(newState).toBeDefined();
      expect(newState).not.toBe(state);
      
      // Then: 元の状態は変更されない
      expect(state.resources).toBe(originalResources);
      expect(state.eventHistory).toEqual(originalEventHistory);
      
      // Then: 新しい状態では適切に処理されている
      expect(newState.resources).toBe(Math.min(3, originalResources + 2)); // max 3
      expect(newState.eventHistory.length).toBe(originalEventHistory.length + 1);
      expect(newState.eventHistory[newState.eventHistory.length - 1]).toMatchObject({
        type: 'RESOURCE_CHANGED',
        data: {
          oldValue: originalResources,
          newValue: newState.resources,
          change: newState.resources - originalResources,
          reason: 'テスト効果'
        }
      });
    });
  });
});