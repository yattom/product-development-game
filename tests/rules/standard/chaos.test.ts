import { ChaosLevel2Rule } from '../../../src/rules/standard/chaos';
import { GameContext } from '../../../src/rules/interfaces';
import { ActionType } from '../../../src/rules/interfaces';
import { createTestGameState, createTestPlayer, createTestCard } from '../../fixture/create_helper';

describe('ChaosLevel2Rule', () => {
  describe('イミュータブル対応', () => {
    it('apply()メソッドは新しいGameStateを返し、元の状態を変更しない', () => {
      // Given: テスト用のゲーム状態を作成（混沌レベル2）
      const testCard = createTestCard();
      const player1 = createTestPlayer(testCard);
      const player2 = createTestPlayer();
      
      const deckCard1 = createTestCard();
      const deckCard2 = createTestCard();
      
      const state = createTestGameState({
        players: [player1, player2],
        currentPlayerIndex: 0,
        chaosLevel: 2,
        deck: [deckCard1, deckCard2],
        eventHistory: []
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.PlayCard,
          payload: { cardId: testCard.id }
        },
        currentCard: testCard,
        metadata: {}
      };
      
      const originalDeckLength = state.deck.length;
      const originalPlayerHandSize = player1.getHandSize();
      const originalEventHistory = [...state.eventHistory];
      
      // When: ルールを適用
      const rule = new ChaosLevel2Rule();
      const newState = rule.apply(context);
      
      // Then: 新しいGameStateが返される
      expect(newState).toBeDefined();
      expect(newState).not.toBe(state);
      
      // Then: 元の状態は変更されない
      expect(state.deck.length).toBe(originalDeckLength);
      expect(state.players[0].getHandSize()).toBe(originalPlayerHandSize);
      expect(state.eventHistory).toEqual(originalEventHistory);
      
      // Then: 新しい状態では適切に処理されている
      // 山札から1枚引いて手札に加える処理
      expect(newState.deck.length).toBe(originalDeckLength - 1);
      expect(newState.players[0].getHandSize()).toBe(originalPlayerHandSize); // 引いて捨てるので同じ
      expect(newState.eventHistory.length).toBeGreaterThan(originalEventHistory.length);
      
      // カードを引いたイベントが記録されている
      const drawEvent = newState.eventHistory.find(event => event.type === 'CARD_DRAWN');
      expect(drawEvent).toBeDefined();
      expect(drawEvent?.data).toMatchObject({
        playerId: player1.id,
        playerName: player1.name,
        playerIndex: 0
      });
    });
  });
});