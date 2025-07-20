import { PayResourcesRule } from '../../../src/rules/standard/resources';
import { GameContext } from '../../../src/rules/interfaces';
import { ActionType } from '../../../src/rules/interfaces';
import { createTestGameState, createTestPlayer } from '../../fixture/create_helper';

describe('PayResourcesRule', () => {
  describe('イミュータブル対応', () => {
    it('apply()メソッドは新しいGameStateを返し、元の状態を変更しない', () => {
      // Given: テスト用のゲーム状態を作成
      const player1 = createTestPlayer();
      const player2 = createTestPlayer();
      
      const state = createTestGameState({
        players: [player1, player2],
        currentPlayerIndex: 0,
        resources: 3,
        eventHistory: []
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.PayResources,
          payload: {}
        },
        metadata: {
          effectParams: {
            amount: 2,
            purpose: 'カード効果'
          }
        }
      };
      
      const originalEventHistory = [...state.eventHistory];
      const originalResources = state.resources;
      
      // When: ルールを適用
      const rule = new PayResourcesRule();
      const newState = rule.apply(context);
      
      // Then: 新しいGameStateが返される
      expect(newState).toBeDefined();
      expect(newState).not.toBe(state);
      
      // Then: 元の状態は変更されない
      expect(state.eventHistory).toEqual(originalEventHistory);
      expect(state.resources).toBe(originalResources);
      
      // Then: 新しい状態では適切に処理されている
      expect(newState.resources).toBe(1); // 3 - 2 = 1
      expect(newState.eventHistory.length).toBe(originalEventHistory.length + 1);
      expect(newState.eventHistory[newState.eventHistory.length - 1]).toMatchObject({
        type: 'RESOURCE_CHANGED',
        data: {
          oldValue: 3,
          newValue: 1,
          change: -2,
          reason: '支払い: カード効果'
        }
      });
    });

    it('リソースが足りない場合は0になる', () => {
      // Given: リソースが少ないゲーム状態
      const player1 = createTestPlayer();
      
      const state = createTestGameState({
        players: [player1],
        resources: 1,
        eventHistory: []
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.PayResources,
          payload: {}
        },
        metadata: {
          effectParams: {
            amount: 3,
            purpose: 'テスト'
          }
        }
      };
      
      // When: ルールを適用
      const rule = new PayResourcesRule();
      const newState = rule.apply(context);
      
      // Then: リソースが0になる
      expect(newState.resources).toBe(0);
      expect(newState.eventHistory[newState.eventHistory.length - 1].data.change).toBe(-1);
    });
  });
});