// Jest functions are globally available
import {Card} from '../src/models/card';
import {GameState} from '../src/models/gameState';
import {Player} from '../src/models/player';
import {VictoryCondition} from '../src/models/victoryCondition';
import {DefeatCondition} from '../src/models/defeatCondition';
import {Category, ActionType, RuleType, GameEventType} from '../src/rules/interfaces';
import {PlaceCardRule, PlayCardRule} from '../src/rules/standard/actions';

describe('Models and Rules Interaction', () => {
    it('手札を置き場において元々あったカードを1枚レーンに動かす', () => {
        // カードを作成
        const handCard = new Card({
            id: 'test-card-1',
            name: 'テストカード1',
            description: 'テスト用のカード',
            categories: [Category.Technology],
            situationEffect: 1
        });

        const workplaceCard = new Card({
            id: 'test-card-2',
            name: 'テストカード2',
            description: 'テスト用のカード（職場に配置）',
            categories: [Category.Technology],
            situationEffect: 2
        });

        // プレイヤーを作成
        const player = new Player({
            id: 'test-player',
            name: 'テストプレイヤー',
            hand: [handCard]
        });

        // ゲーム状態を作成
        const gameState = new GameState({
            players: [player],
            currentPlayerIndex: 0,
            deck: [],
            workplaces: {
                [Category.Technology]: workplaceCard
            },
            completionLane: [],
            chaosLevel: 0,
            resources: 2,
            activeRuleSet: {
                id: 'test-ruleset',
                name: 'テストルールセット',
                description: 'テスト用のルールセット',
                rules: []
            },
            victoryConditions: [],
            defeatConditions: []
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
            currentCard: handCard,
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
        // モックのルールを作成
        const mockEffectRule = {
            id: 'mock-effect-rule',
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
            id: 'test-card-1',
            name: 'テストカード1',
            description: 'テスト用のカード',
            categories: [Category.Technology],
            situationEffect: 1,
            playEffect: {
                ruleId: 'mock-effect-rule',
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
        const gameState = new GameState({
            players: [player],
            currentPlayerIndex: 0,
            deck: [],
            workplaces: {},
            completionLane: [],
            chaosLevel: 0,
            resources: 2,
            activeRuleSet: {
                id: 'test-ruleset',
                name: 'テストルールセット',
                description: 'テスト用のルールセット',
                rules: []
            },
            victoryConditions: [],
            defeatConditions: []
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
        expect(mockRuleRegistry.getRule).toHaveBeenCalledWith('mock-effect-rule');
        expect(mockEffectRule.apply).toHaveBeenCalled();
        expect(mockEffectRule.apply.mock.calls[0][0].metadata.effectParams).toEqual({amount: 2});

        // 4. カードが捨て札に追加されていること
        expect(gameState.discard.length).toBe(1);
        expect(gameState.discard[0].id).toBe(handCard.id);
    });
});
