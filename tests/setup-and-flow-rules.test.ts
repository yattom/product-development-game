// Jest functions are globally available
import {ActionType} from '../src';
import {StandardSetupRule} from "../src/rules/standard/setup";
import {createTestCard, createTestGameState, createTestPlayer} from './fixture/create_helper';

describe('セットアップとゲームフローのルール', () => {
    it('最小限のセットアップができる', () => {
        let deck = Array.from({length: 10}, () => createTestCard());
        let gameState = createTestGameState({
            players: [createTestPlayer(), createTestPlayer()],
            deck: deck,
        });
        const setupRule = new StandardSetupRule();
        setupRule.apply({
            state: gameState,
            currentAction: {
                type: ActionType.TurnStart,
                payload: {
                    playerIndex: 0
                }
            },
            metadata: {}
        });

        // 検証
        // 手札が配られている
        expect(gameState.players[0].getHandSize()).toBe(3);
        expect(gameState.players[1].getHandSize()).toBe(3);

        // 山札が10-6枚残っていて、シャッフルされている
        expect(gameState.deck.length).toBe(10 - 3 - 3);
        // 山札の全てのカードのidを結合して、順序通りでないことを確認
        expect(gameState.deck.map(card => card.id).join(',')).not.toBe('test-card-1,test-card-2,test-card-3,test-card-4')
    });
});
