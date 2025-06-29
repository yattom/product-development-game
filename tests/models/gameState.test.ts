import {createTestCard, createTestGameState, createTestPlayer} from '../fixture/create_helper';
import {Category} from "../../src";

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

        describe('moveCardToCompletionLane', () => {
            it('指定したカードをcompletionLaneに加えた新しいGameStateを返す', () => {
                const state = createTestGameState({
                    completionLane: [],
                });
                const card = createTestPlayer().hand[0];
                const nextState = state.moveCardToCompletionLane(card);
                expect(nextState).not.toBe(state);
                expect(nextState.completionLane).toEqual([card]);
                expect(state.completionLane).toEqual([]);
            });
        });

        describe('placeCardInWorkplace', () => {
            it('指定したカテゴリにカードを配置し新しいGameStateを返す。元のカードも返す', () => {
                const card1 = createTestCard()
                const card2 = createTestCard()
                const workplaces: Record<Category, any> = {
                    [Category.Technology]: card1,
                    [Category.User]: null,
                    [Category.Management]: null
                }
                const state = createTestGameState({workplaces});
                const {previousCard, state: nextState} = state.placeCardInWorkplace(card2, Category.Technology);
                expect(previousCard).toBe(card1);
                expect(nextState).not.toBe(state);
                expect(nextState.workplaces[Category.Technology]).toBe(card2);
                expect(state.workplaces[Category.Technology]).toBe(card1);
            });
            it('カテゴリ不一致のカードを配置しようとすると例外', () => {
                const card = createTestCard({categories: [Category.User]})
                // card.categoriesに0(Category.Technology)が含まれている前提
                const state = createTestGameState();
                expect(() => state.placeCardInWorkplaceMUTING(card, Category.Technology)).toThrow();
            });
        });

        describe('modifyResources', () => {
            it('リソースを正しく変更し、新しいGameStateを返す', () => {
                const state = createTestGameState({ resources: 1 });
                const nextState = state.modifyResources(1);
                expect(nextState).not.toBe(state);
                expect(nextState.resources).toBe(2);
                expect(state.resources).toBe(1);
            });

            it('リソースが0未満にも4以上にもならない', () => {
                const state1 = createTestGameState({ resources: 0 });
                const nextState1 = state1.modifyResources(-1);
                expect(nextState1.resources).toBe(0);

                const state2 = createTestGameState({ resources: 3 });
                const nextState2 = state2.modifyResources(1);
                expect(nextState2.resources).toBe(3);
            });
        });
    });
});
