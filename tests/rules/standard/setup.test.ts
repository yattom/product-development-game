import { StandardSetupRule } from '../../../src/rules/standard/setup';
import { GameContext } from '../../../src/rules/interfaces';
import { ActionType } from '../../../src/rules/interfaces';
import { createTestGameState } from '../../fixture/create_helper';
import { createTestCard } from '../../fixture/create_helper';
import { Player } from '../../../src/models/player';

describe('StandardSetupRule', () => {
  describe('イミュータブル対応', () => {
    it('apply()メソッドは新しいGameStateを返し、元の状態を変更しない', () => {
      // Given: テスト用のゲーム状態を作成（手札なしのプレイヤー2人）
      const card1 = createTestCard();
      const card2 = createTestCard();
      const card3 = createTestCard();
      const card4 = createTestCard();
      const card5 = createTestCard();
      const card6 = createTestCard();
      
      const player1 = new Player({ id: 'player1', name: 'プレイヤー1', hand: [] });
      const player2 = new Player({ id: 'player2', name: 'プレイヤー2', hand: [] });
      
      const state = createTestGameState({
        players: [player1, player2],
        deck: [card1, card2, card3, card4, card5, card6],
        discard: [],
        eventHistory: [] // 最初のターン開始時であることを示す
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.TurnStart,
          payload: {}
        },
        metadata: {}
      };
      
      const originalDeck = [...state.deck];
      const originalPlayers = state.players.map(p => ({
        id: p.id,
        handSize: p.getHandSize()
      }));
      const originalVictoryConditions = [...state.victoryConditions];
      const originalDefeatConditions = [...state.defeatConditions];
      const originalMetadata = { ...state.metadata };
      
      // When: ルールを適用
      const rule = new StandardSetupRule();
      const newState = rule.apply(context);
      
      // Then: 新しいGameStateが返される
      expect(newState).toBeDefined();
      expect(newState).not.toBe(state);
      
      // Then: 元の状態は変更されない
      expect(state.deck).toEqual(originalDeck);
      expect(state.players.map(p => ({ id: p.id, handSize: p.getHandSize() }))).toEqual(originalPlayers);
      expect(state.victoryConditions).toEqual(originalVictoryConditions);
      expect(state.defeatConditions).toEqual(originalDefeatConditions);
      expect(state.metadata).toEqual(originalMetadata);
      
      // Then: 新しい状態では適切にセットアップされている
      expect(newState.players.every(p => p.getHandSize() === 3)).toBe(true);
      expect(newState.victoryConditions.length).toBeGreaterThan(0);
      expect(newState.defeatConditions.length).toBeGreaterThan(0);
      expect(newState.getMetadata('roundsSinceChaosModified')).toBe(0);
    });
  });
});