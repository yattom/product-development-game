import {ActionType, GameContext, GameRule, RuleType} from '../interfaces';
import {Card} from '../../models/card';
import {VictoryCondition, VictoryConditionType} from '../../models/victoryCondition';
import {DefeatCondition, DefeatConditionType} from '../../models/defeatCondition';
import {GameState} from '../../models/gameState';

/**
 * 標準ゲームセットアップルール
 * ゲームの初期状態を設定する
 */
export class StandardSetupRule implements GameRule {
    readonly id = 'standard-setup';
    readonly name = '標準セットアップ';
    readonly description = '標準的なゲームセットアップを行います';
    readonly type = RuleType.Setup;

    /**
     * このルールが適用可能かどうかを判断する
     * @param context ゲームコンテキスト
     * @returns ゲーム開始時のセットアップアクションなら適用可能
     */
    isApplicable(context: GameContext): boolean {
        return context.currentAction?.type === ActionType.TurnStart &&
            context.state.eventHistory.length === 0; // 最初のターン開始時のみ適用
    }

    /**
     * ゲームの初期設定を行う
     * @param context ゲームコンテキスト
     * @returns 新しいGameState
     */
    apply(context: GameContext): GameState {
        const {state} = context;

        // 山札をシャッフル（イミュータブル）
        // 各プレイヤーに手札を配る（3枚ずつ）
        const shuffledState = state.newState({deck: this.shuffleDeck([...state.deck])});
        const stateAfterDealing = this.dealCardsToPlayers(shuffledState);

        // 勝利条件と敗北条件を設定
        return stateAfterDealing
            .setVictoryConditions(this.setupVictoryConditions())
            .setDefeatConditions(this.setupDefeatConditions())
            .setMetadata('roundsSinceChaosModified', 0);
    }

    /**
     * 山札をシャッフルする（イミュータブル）
     * @param deck シャッフルする山札
     * @returns シャッフルされた新しい山札
     */
    private shuffleDeck(deck: Card[]): Card[] {
        const newDeck = [...deck];
        // ランダムに並べ替え
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        return newDeck;
    }

    /**
     * 勝利条件を設定する
     * @returns 勝利条件の配列
     */
    private setupVictoryConditions(): VictoryCondition[] {
        // 今回のゲームで使用する勝利条件をランダムに選択
        const victoryTypes = [
            VictoryConditionType.BalancedProduct,
            VictoryConditionType.WorldChangingInnovation,
            VictoryConditionType.FireExtinguishing
        ];

        const selectedType = victoryTypes[Math.floor(Math.random() * victoryTypes.length)];
        const victoryCondition = VictoryCondition.createStandard(selectedType);

        return [victoryCondition];
    }

    /**
     * 敗北条件を設定する
     * @returns 敗北条件の配列
     */
    private setupDefeatConditions(): DefeatCondition[] {
        // 標準の敗北条件を全て設定
        const defeatConditions = [
            DefeatCondition.createStandard(DefeatConditionType.DeckDepletion),
            DefeatCondition.createStandard(DefeatConditionType.ChaosOverflow),
            DefeatCondition.createStandard(DefeatConditionType.StagnationPenalty)
        ];

        return defeatConditions;
    }

    /**
     * プレイヤーに手札を配る（イミュータブル）
     * @param state 配布前のゲーム状態
     * @returns 配布後のゲーム状態
     */
    private dealCardsToPlayers(state: GameState): GameState {
        return state.players.reduce((currentState, player, index) => {
            const drawResult = currentState.drawCards(3);
            const updatedPlayer = drawResult.drawnCards.reduce(
                (p, card) => p.addCardToHand(card),
                player
            );
            
            // プレイヤー配列を更新したGameStateを返す
            const updatedPlayers = [...currentState.players];
            updatedPlayers[index] = updatedPlayer;
            
            return drawResult.state.newState({ players: updatedPlayers });
        }, state);
    }
}
