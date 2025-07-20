import { PlayCardRule, PlaceCardRule, DiscardCardRule } from '../../../src/rules/standard/actions';
import { GameContext } from '../../../src/rules/interfaces';
import { ActionType } from '../../../src/rules/interfaces';
import { createTestGameState, createTestPlayer, createTestCard } from '../../fixture/create_helper';

describe('PlayCardRule', () => {
  describe('イミュータブル対応', () => {
    it('apply()メソッドは新しいGameStateを返し、元の状態を変更しない', () => {
      // Given: テスト用のゲーム状態とプレイヤーを作成
      const testCard = createTestCard();
      const player1 = createTestPlayer(testCard);
      const player2 = createTestPlayer();
      
      const state = createTestGameState({
        players: [player1, player2],
        currentPlayerIndex: 0,
        eventHistory: [],
        discard: []
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
      
      const originalEventHistory = [...state.eventHistory];
      const originalDiscard = [...state.discard];
      const originalPlayerHandSize = player1.getHandSize();
      
      // When: ルールを適用
      const rule = new PlayCardRule();
      const newState = rule.apply(context);
      
      // Then: 新しいGameStateが返される
      expect(newState).toBeDefined();
      expect(newState).not.toBe(state);
      
      // Then: 元の状態は変更されない
      expect(state.eventHistory).toEqual(originalEventHistory);
      expect(state.discard).toEqual(originalDiscard);
      expect(state.players[0].getHandSize()).toBe(originalPlayerHandSize);
      
      // Then: 新しい状態では適切に処理されている
      expect(newState.players[0].getHandSize()).toBe(originalPlayerHandSize - 1);
      expect(newState.discard.length).toBe(originalDiscard.length + 1);
      expect(newState.discard).toContainEqual(testCard);
      expect(newState.eventHistory.length).toBe(originalEventHistory.length + 1);
      expect(newState.eventHistory[newState.eventHistory.length - 1]).toMatchObject({
        type: 'CARD_PLAYED',
        data: {
          playerId: player1.id,
          playerName: player1.name,
          playerIndex: 0,
          cardId: testCard.id,
          cardName: testCard.name
        }
      });
    });
  });
});

describe('PlaceCardRule', () => {
  describe('イミュータブル対応', () => {
    it('apply()メソッドは新しいGameStateを返し、元の状態を変更しない', () => {
      // Given: テスト用のゲーム状態とプレイヤーを作成
      const testCard = createTestCard();
      const player1 = createTestPlayer(testCard);
      const player2 = createTestPlayer();
      
      const state = createTestGameState({
        players: [player1, player2],
        currentPlayerIndex: 0,
        eventHistory: [],
        resources: 1
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.PlaceCard,
          payload: { cardId: testCard.id, category: 'Technology' }
        },
        currentCard: testCard,
        metadata: {}
      };
      
      const originalEventHistory = [...state.eventHistory];
      const originalResources = state.resources;
      const originalPlayerHandSize = player1.getHandSize();
      
      // When: ルールを適用
      const rule = new PlaceCardRule();
      const newState = rule.apply(context);
      
      // Then: 新しいGameStateが返される
      expect(newState).toBeDefined();
      expect(newState).not.toBe(state);
      
      // Then: 元の状態は変更されない
      expect(state.eventHistory).toEqual(originalEventHistory);
      expect(state.resources).toBe(originalResources);
      expect(state.players[0].getHandSize()).toBe(originalPlayerHandSize);
      
      // Then: 新しい状態では適切に処理されている
      expect(newState.players[0].getHandSize()).toBe(originalPlayerHandSize - 1);
      expect(newState.eventHistory.length).toBeGreaterThan(originalEventHistory.length);
    });
  });
});

describe('DiscardCardRule', () => {
  describe('イミュータブル対応', () => {
    it('apply()メソッドは新しいGameStateを返し、元の状態を変更しない', () => {
      // Given: テスト用のゲーム状態とプレイヤーを作成
      const testCard = createTestCard();
      const player1 = createTestPlayer(testCard);
      const player2 = createTestPlayer();
      
      const state = createTestGameState({
        players: [player1, player2],
        currentPlayerIndex: 0,
        eventHistory: [],
        discard: []
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.DiscardCard,
          payload: { cardId: testCard.id }
        },
        currentCard: testCard,
        metadata: {}
      };
      
      const originalEventHistory = [...state.eventHistory];
      const originalDiscard = [...state.discard];
      const originalPlayerHandSize = player1.getHandSize();
      
      // When: ルールを適用
      const rule = new DiscardCardRule();
      const newState = rule.apply(context);
      
      // Then: 新しいGameStateが返される
      expect(newState).toBeDefined();
      expect(newState).not.toBe(state);
      
      // Then: 元の状態は変更されない
      expect(state.eventHistory).toEqual(originalEventHistory);
      expect(state.discard).toEqual(originalDiscard);
      expect(state.players[0].getHandSize()).toBe(originalPlayerHandSize);
      
      // Then: 新しい状態では適切に処理されている
      expect(newState.players[0].getHandSize()).toBe(originalPlayerHandSize - 1);
      expect(newState.discard.length).toBe(originalDiscard.length + 1);
      expect(newState.discard).toContainEqual(testCard);
      expect(newState.eventHistory.length).toBe(originalEventHistory.length + 1);
    });
  });
});