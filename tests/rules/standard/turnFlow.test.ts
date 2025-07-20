import { StandardTurnStartRule } from '../../../src/rules/standard/turnFlow';
import { GameContext } from '../../../src/rules/interfaces';
import { ActionType } from '../../../src/rules/interfaces';
import { createTestGameState, createTestPlayer } from '../../fixture/create_helper';

describe('StandardTurnStartRule', () => {
  describe('イミュータブル対応', () => {
    it('apply()メソッドは新しいGameStateを返し、元の状態を変更しない', () => {
      // Given: テスト用のゲーム状態を作成
      const player1 = createTestPlayer();
      const player2 = createTestPlayer();
      
      const state = createTestGameState({
        players: [player1, player2],
        currentPlayerIndex: 0,
        eventHistory: []
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.TurnStart,
          payload: {}
        },
        metadata: {}
      };
      
      const originalEventHistory = [...state.eventHistory];
      
      // When: ルールを適用
      const rule = new StandardTurnStartRule();
      const newState = rule.apply(context);
      
      // Then: 新しいGameStateが返される
      expect(newState).toBeDefined();
      expect(newState).not.toBe(state);
      
      // Then: 元の状態は変更されない
      expect(state.eventHistory).toEqual(originalEventHistory);
      
      // Then: 新しい状態ではターン開始イベントが記録されている
      expect(newState.eventHistory.length).toBe(originalEventHistory.length + 1);
      expect(newState.eventHistory[newState.eventHistory.length - 1]).toMatchObject({
        type: 'PLAYER_TURN_STARTED',
        data: {
          playerId: player1.id,
          playerName: player1.name,
          playerIndex: 0
        }
      });
    });
  });
});