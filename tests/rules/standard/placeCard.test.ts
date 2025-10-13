import { PlaceCardRule } from '../../../src/rules/standard/actions';
import {GameContext, GameEventType} from '../../../src/rules/interfaces';
import { ActionType, Category } from '../../../src/rules/interfaces';
import { createTestGameState, createTestPlayer, createTestCard } from '../../fixture/create_helper';

describe('PlaceCardRule', () => {
  describe('applying the rule', () => {
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

    it('workplace から lane への pushout でstate が mutate される', () => {
      // Given: 既にworkplaceにカードが配置されている状態
      const existingCard = createTestCard({ situationEffect: 2 }); // リソースカード
      const newCard = createTestCard({ situationEffect: 1 });
      const player1 = createTestPlayer(newCard);
      
      const state = createTestGameState({
        players: [player1],
        currentPlayerIndex: 0,
        eventHistory: [],
        resources: 1,
        workplaces: {
          TECHNOLOGY: existingCard, // 既存のカード
          USER: null,
          MANAGEMENT: null
        },
        completionLane: [] // 空のレーン
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.PlaceCard,
          payload: { 
            cardId: newCard.id, 
            category: Category.Technology,
            pushOutOption: 'lane' // レーンに移動
          }
        },
        currentCard: undefined,
        metadata: {}
      };
      
      // 元の状態を記録
      const originalResources = state.resources;
      const originalCompletionLaneLength = state.completionLane.length;
      const originalEvents = [...state.eventHistory];
      
      // When: ルールを適用
      const rule = new PlaceCardRule();
      const newState = rule.apply(context);

      // 元のstateは変更されない
      expect(state.resources).toBe(originalResources);
      expect(state.completionLane.length).toBe(originalCompletionLaneLength);
      expect(state.eventHistory).toEqual(originalEvents);
      
      // 新しいstateでは適切に処理されている
      expect(newState.resources).toBe(originalResources + newCard.situationEffect - existingCard.situationEffect);
      expect(newState.completionLane.length).toBe(1);
      expect(newState.eventHistory.length).toBe(3);
      expect(newState.eventHistory[0].type).toBe(GameEventType.ResourceChanged);
      expect(newState.eventHistory[1].type).toBe(GameEventType.CardPlaced);
      expect(newState.eventHistory[2].type).toBe(GameEventType.ResourceChanged);
    });

    it('workplace から discard への pushout でstate が mutate される', () => {
      // Given: 既にworkplaceにトラブルカードが配置されている状態
      const existingTroubleCard = createTestCard({ situationEffect: -2 }); // トラブルカード
      const newCard = createTestCard({ situationEffect: 1 });
      const player1 = createTestPlayer(newCard);
      
      const state = createTestGameState({
        players: [player1],
        currentPlayerIndex: 0,
        eventHistory: [],
        resources: 3, // 十分なリソース
        workplaces: {
          TECHNOLOGY: existingTroubleCard, // 既存のトラブルカード
          USER: null,
          MANAGEMENT: null
        },
        discard: [] // 空の捨て札
      });
      
      const context: GameContext = {
        state,
        currentAction: {
          type: ActionType.PlaceCard,
          payload: { 
            cardId: newCard.id, 
            category: Category.Technology,
            pushOutOption: 'discard' // 捨て札に移動
          }
        },
        currentCard: undefined,
        metadata: {}
      };
      
      // 元の状態を記録
      const originalResources = state.resources;
      const originalDiscardLength = state.discard.length;
      const originalEvents = [...state.eventHistory];
      
      // When: ルールを適用
      const rule = new PlaceCardRule();
      const newState = rule.apply(context);
      
      // 元のstateは変更されない
      expect(state.resources).toBe(originalResources);
      expect(state.discard.length).toBe(originalDiscardLength);
      expect(state.eventHistory).toEqual(originalEvents);
      
      // 新しいstateでは適切に処理されている
      expect(newState.resources).toBe(originalResources - 2); // トラブル解消コスト支払い
      expect(newState.discard.length).toBe(1); // カードが捨て札に追加
      expect(newState.eventHistory.length).toBe(2); // カード配置 + リソース変更イベント
    });
  });
});