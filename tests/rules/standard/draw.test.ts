import { StandardDrawRule } from '../../../src/rules/standard/turnFlow';
import { GameContext } from '../../../src/rules/interfaces';
import { ActionType, GameEventType } from '../../../src/rules/interfaces';
import { createTestGameState, createTestPlayer, createTestCard } from '../../fixture/create_helper';

/**
 * StandardDrawRule のイミュータブル対応テスト（TDD: まずは落ちるテスト）
 */
describe('StandardDrawRule (イミュータブル対応)', () => {
  it('apply() は新しい GameState を返し、元の state を変更せず、手札を最大3枚まで補充し、CARD_DRAWN イベントを記録する', () => {
    // Given: 手札が1枚、山札が2枚の状態
    const handCard = createTestCard();
    const deckCard1 = createTestCard();
    const deckCard2 = createTestCard();

    const player1 = createTestPlayer(handCard);
    const player2 = createTestPlayer();

    const state = createTestGameState({
      players: [player1, player2],
      currentPlayerIndex: 0,
      deck: [deckCard1, deckCard2],
      eventHistory: []
    });

    const context: GameContext = {
      state,
      currentAction: { type: ActionType.TurnEnd, payload: {} },
      metadata: {}
    };

    const originalDeck = [...state.deck];
    const originalEventHistory = [...state.eventHistory];
    const originalHandSize = player1.getHandSize();

    // When
    const rule = new StandardDrawRule();
    const newState = rule.apply(context);

    // Then: 新しいGameStateが返される（参照が異なる）
    expect(newState).toBeDefined();
    expect(newState).not.toBe(state);

    // Then: 元の状態は変更されない
    expect(state.deck).toEqual(originalDeck);
    expect(state.eventHistory).toEqual(originalEventHistory);
    expect(state.players[0].getHandSize()).toBe(originalHandSize);

    // Then: 新しい状態では手札が3枚になるまで補充される（最大3）
    expect(newState.players[0].getHandSize()).toBe(Math.min(3, originalHandSize + originalDeck.length));
    expect(newState.deck.length).toBe(originalDeck.length - (newState.players[0].getHandSize() - originalHandSize));

    // Then: 引いた枚数ぶんの CARD_DRAWN イベントが記録される
    const drawEvents = newState.eventHistory.filter(e => e.type === GameEventType.CardDrawn);
    expect(drawEvents.length).toBe(newState.players[0].getHandSize() - originalHandSize);

    // イベントの一部内容を確認
    if (drawEvents.length > 0) {
      expect(drawEvents[0].data).toMatchObject({
        playerId: player1.id,
        playerName: player1.name,
        playerIndex: 0
      });
    }
  });
});
