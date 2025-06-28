import {Card, Category, GameState, Player} from '../../src';

// Single ID sequence counter for all types
let idCounter = 0;

export function getNextId(): number {
    return ++idCounter;
}

export function createTestCard(overrides = {}) {
    const uniqueId = getNextId();
    return new Card({
        id: `test-card-${uniqueId}`,
        name: `テストカード-${uniqueId}`,
        description: `テスト用のカード-${uniqueId}`,
        categories: [Category.Technology],
        situationEffect: 1,
        ...overrides
    });
}

export function createTestPlayer(handCard?: Card) {
    // プレイヤーを作成
    const uniqueId = getNextId();
    return new Player({
        id: `test-player-${uniqueId}`,
        name: `テストプレイヤー-${uniqueId}`,
        hand: handCard ? [handCard] : []
    });
}

export function createTestGameState(overrides = {}) {
    const deck: Card[] = 'deck' in overrides ? (overrides.deck as Card[]) : Array.from({length: 10}, () => createTestCard());
    return new GameState({
        players: [createTestPlayer(createTestCard())],
        currentPlayerIndex: 0,
        deck: deck,
        workplaces: {},
        completionLane: [],
        chaosLevel: 0,
        resources: 2,
        activeRuleSet: {
            id: `test-ruleset-${getNextId()}`,
            name: 'テストルールセット',
            description: 'テスト用のルールセット',
            rules: []
        },
        victoryConditions: [],
        defeatConditions: [],
        ...overrides
    });
}
