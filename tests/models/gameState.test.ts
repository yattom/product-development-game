import {createTestGameState, createTestPlayer} from '../fixture/create_helper';

describe('GameState', () => {
    describe('immutableであること', () => {
        describe('moveToNextPlayer', () => {
            it('次のプレイヤーに順番を移した新しいGameStateを返す', () => {
                const state = createTestGameState({
                    players: [createTestPlayer(), createTestPlayer(), createTestPlayer()],
                    currentPlayerIndex: 0,
                });
                const nextState = state.moveToNextPlayer();
                expect(nextState).not.toBe(state);
                expect(nextState.currentPlayerIndex).toBe(1);
                expect(state.currentPlayerIndex).toBe(0);
            });

            it('最後のプレイヤーの次は最初に戻る', () => {
                const state = createTestGameState({
                    players: [createTestPlayer(), createTestPlayer(), createTestPlayer()],
                    currentPlayerIndex: 2,
                });
                const nextState = state.moveToNextPlayer();
                expect(nextState.currentPlayerIndex).toBe(0);
            });
        });

        describe('setCurrentPlayerIndexXXX', () => {
            it('指定したインデックスで新しいGameStateを返す', () => {
                const state = createTestGameState({
                    players: [createTestPlayer(), createTestPlayer(), createTestPlayer()],
                    currentPlayerIndex: 0,
                });
                const nextState = state.setCurrentPlayerIndex(2);
                expect(nextState).not.toBe(state);
                expect(nextState.currentPlayerIndex).toBe(2);
                expect(state.currentPlayerIndex).toBe(0);
            });

            it('不正なインデックスを指定した場合は例外を投げる', () => {
                const state = createTestGameState({
                    players: [createTestPlayer(), createTestPlayer(), createTestPlayer()],
                    currentPlayerIndex: 0,
                });
                expect(() => state.setCurrentPlayerIndex(-1)).toThrow();
                expect(() => state.setCurrentPlayerIndex(3)).toThrow();
            });
        });

        describe('discardCards', () => {
            it('指定したカードを捨て札に加えた新しいGameStateを返す', () => {
                const state = createTestGameState({
                    discard: [],
                });
                const card1 = createTestPlayer().hand[0];
                const card2 = createTestPlayer().hand[0];
                const nextState = state.discardCards([card1, card2]);
                expect(nextState).not.toBe(state);
                expect(nextState.discard).toEqual([card1, card2]);
                expect(state.discard).toEqual([]);
            });
        });
    });
});
