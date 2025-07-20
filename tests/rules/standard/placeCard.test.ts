import { PlaceCardRule } from '../../../src/rules/standard/actions';
import { GameContext } from '../../../src/rules/interfaces';
import { ActionType, Category } from '../../../src/rules/interfaces';
import { createTestGameState, createTestPlayer, createTestCard } from '../../fixture/create_helper';

describe('PlaceCardRule', () => {
  describe('シンプルなカード配置', () => {
    it('空のカテゴリに効果なしカードを配置する', () => {
      // Given: 効果なしのテストカードを持つプレイヤー
      const testCard = createTestCard({situationEffect: 0}); // デフォルトで効果1のはず
      const player1 = createTestPlayer(testCard);
      
      const state = createTestGameState({
        players: [player1],
        currentPlayerIndex: 0,
        eventHistory: [],
        workplaces: {
          TECHNOLOGY: null, // 空のカテゴリ
          USER: null,
          MANAGEMENT: null
        }
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.PlaceCard,
          payload: { cardId: testCard.id, category: Category.Technology }
        },
        currentCard: undefined, // PlaceCardではcurrentCardを指定しない
        metadata: {}
      };
      
      const originalHandSize = player1.getHandSize();
      const originalEventHistory = [...state.eventHistory];
      
      // When: ルールを適用
      const rule = new PlaceCardRule();
      const newState = rule.apply(context);
      
      // Then: 新しいGameStateが返される
      expect(newState).toBeDefined();
      expect(newState).not.toBe(state);
      
      // Then: 元の状態は変更されない
      expect(state.eventHistory).toEqual(originalEventHistory);
      expect(state.players[0].getHandSize()).toBe(originalHandSize);
      expect(state.workplaces.TECHNOLOGY).toBeNull();
      
      // Then: 新しい状態では適切に処理されている
      expect(newState.players[0].getHandSize()).toBe(originalHandSize - 1);
      expect(newState.workplaces.TECHNOLOGY).toEqual(testCard);
      expect(newState.eventHistory.length).toBe(originalEventHistory.length + 1);
      expect(newState.eventHistory[newState.eventHistory.length - 1]).toMatchObject({
        type: 'CARD_PLACED',
        data: {
          playerId: player1.id,
          playerIndex: 0,
          cardId: testCard.id,
          category: Category.Technology
        }
      });
    });
  });
});