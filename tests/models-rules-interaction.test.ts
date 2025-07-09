// Jest functions are globally available
import {ActionType, Card, Category, GameEventType, Player, RuleType} from '../src';
import {PlaceCardRule, PlayCardRule} from '../src/rules/standard/actions';
import {createTestCard, createTestGameState, createTestPlayer, getNextId} from './fixture/create_helper';

describe('Models and Rules Interaction', () => {
    it('手札を置き場において元々あったカードを1枚レーンに動かす', () => {
        // カードを作成
        const handCard = createTestCard({});

        const workplaceCard = createTestCard({
            situationEffect: 2
        });
        const player = createTestPlayer(handCard);

        // ゲーム状態を作成
        const gameState = createTestGameState({
            players: [player],
            workplaces: {
                [Category.Technology]: workplaceCard
            },
        });

        // PlaceCardRuleを作成
        const placeCardRule = new PlaceCardRule();

        // カード配置アクションを作成
        const action = {
            type: ActionType.PlaceCard,
            payload: {
                cardId: handCard.id,
                category: Category.Technology,
                pushOutOption: 'lane'
            }
        };

        // ルールを適用
        placeCardRule.apply({
            state: gameState,
            currentAction: action,
            metadata: {}
        });

        // 検証
        // 1. 手札からカードが削除されていること
        expect(player.hand.length).toBe(0);

        // 2. 職場にカードが配置されていること
        expect(gameState.workplaces[Category.Technology]?.id).toBe(handCard.id);

        // 3. 元々あったカードがレーンに移動していること
        expect(gameState.completionLane.length).toBe(1);
        expect(gameState.completionLane[0].id).toBe(workplaceCard.id);
    });
    it('手札からカードをプレイしてその効果を適用する', () => {
        // モックのルールIDを生成
        const mockRuleId = `mock-effect-rule-${getNextId()}`;

        // モックのルールを作成
        const mockEffectRule = {
            id: mockRuleId,
            name: 'モック効果ルール',
            description: 'テスト用のモック効果ルール',
            type: RuleType.CardEffect,
            isApplicable: jest.fn().mockReturnValue(true),
            apply: jest.fn()
        };

        // モックのルールレジストリを作成
        const mockRuleRegistry = {
            getRule: jest.fn().mockReturnValue(mockEffectRule)
        };

        // プレイ効果を持つカードを作成
        const handCard = new Card({
            id: `test-card-${getNextId()}`,
            name: 'テストカード1',
            description: 'テスト用のカード',
            categories: [Category.Technology],
            situationEffect: 1,
            playEffect: {
                ruleId: mockRuleId,
                params: {amount: 2},
                description: 'リソースを2増やす'
            }
        });

        // プレイヤーを作成
        const player = new Player({
            id: 'test-player',
            name: 'テストプレイヤー',
            hand: [handCard]
        });

        // ゲーム状態を作成
        const gameState = createTestGameState({
            players: [player],
        });

        // PlayCardRuleを作成
        const playCardRule = new PlayCardRule();

        // カードプレイアクションを作成
        const action = {
            type: ActionType.PlayCard,
            payload: {
                cardId: handCard.id
            }
        };

        // ルールを適用
        playCardRule.apply({
            state: gameState,
            currentCard: handCard,
            currentAction: action,
            metadata: {
                ruleRegistry: mockRuleRegistry
            }
        });

        // 検証
        // 1. 手札からカードが削除されていること
        expect(player.hand.length).toBe(0);

        // 2. カードプレイイベントが記録されていること
        expect(gameState.eventHistory.length).toBeGreaterThan(0);
        expect(gameState.eventHistory[0].type).toBe(GameEventType.CardPlayed);

        // 3. 効果ルールが呼び出されていること
        expect(mockRuleRegistry.getRule).toHaveBeenCalledWith(mockRuleId);
        expect(mockEffectRule.apply).toHaveBeenCalled();
        expect(mockEffectRule.apply.mock.calls[0][0].metadata.effectParams).toEqual({amount: 2});

        // 4. カードが捨て札に追加されていること
        expect(gameState.discard.length).toBe(1);
        expect(gameState.discard[0].id).toBe(handCard.id);
    });
});
