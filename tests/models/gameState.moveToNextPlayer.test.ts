import {createTestGameState, createTestPlayer} from '../fixture/create_helper';

describe('GameState', () => {
    describe('immutableであること', () => {
        describe('moveToNextPlayer', () => {
            it('次のプレイヤーに順番を移した新しいGameStateを返す', () => {
                const state = createTestGameState({
                    players: [createTestPlayer(), createTestPlayer(), createTestPlayer()],
                    currentPlayerIndex: 0,
                });
                const nextState = state.moveToNextPlayerXXX();
                expect(nextState).not.toBe(state);
                expect(nextState.currentPlayerIndex).toBe(1);
                expect(state.currentPlayerIndex).toBe(0);
            });

            it('最後のプレイヤーの次は最初に戻る', () => {
                const state = createTestGameState({
                    players: [createTestPlayer(), createTestPlayer(), createTestPlayer()],
                    currentPlayerIndex: 2,
                });
                const nextState = state.moveToNextPlayerXXX();
                expect(nextState.currentPlayerIndex).toBe(0);
            });
        });
    });
});
