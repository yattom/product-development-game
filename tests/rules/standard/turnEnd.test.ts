import { StandardTurnEndRule } from '../../../src/rules/standard/turnFlow';
import { GameContext } from '../../../src/rules/interfaces';
import { ActionType } from '../../../src/rules/interfaces';
import { createTestGameState, createTestPlayer } from '../../fixture/create_helper';

describe('StandardTurnEndRule', () => {
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
          type: ActionType.TurnEnd,
          payload: {}
        },
        metadata: {}
      };
      
      const originalEventHistory = [...state.eventHistory];
      const originalCurrentPlayerIndex = state.currentPlayerIndex;
      
      // When: ルールを適用
      const rule = new StandardTurnEndRule();
      const newState = rule.apply(context);
      
      // Then: 新しいGameStateが返される
      expect(newState).toBeDefined();
      expect(newState).not.toBe(state);
      
      // Then: 元の状態は変更されない
      expect(state.eventHistory).toEqual(originalEventHistory);
      expect(state.currentPlayerIndex).toBe(originalCurrentPlayerIndex);
      
      // Then: 新しい状態では適切に処理されている
      expect(newState.currentPlayerIndex).toBe(1); // 次のプレイヤーに移動
      expect(newState.eventHistory.length).toBe(originalEventHistory.length + 1);
      expect(newState.eventHistory[newState.eventHistory.length - 1]).toMatchObject({
        type: 'PLAYER_TURN_ENDED',
        data: {
          playerId: player1.id,
          playerName: player1.name,
          playerIndex: 0
        }
      });
    });

    it('最後のプレイヤーの場合は最初のプレイヤーに戻る', () => {
      // Given: 最後のプレイヤーのターン
      const player1 = createTestPlayer();
      const player2 = createTestPlayer();
      
      const state = createTestGameState({
        players: [player1, player2],
        currentPlayerIndex: 1,
        eventHistory: []
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.TurnEnd,
          payload: {}
        },
        metadata: {}
      };
      
      // When: ルールを適用
      const rule = new StandardTurnEndRule();
      const newState = rule.apply(context);
      
      // Then: 最初のプレイヤーに戻る
      expect(newState.currentPlayerIndex).toBe(0);
    });
  });
});