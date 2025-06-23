import { ActionType, GameContext, GameEventType, GameRule, RuleType } from '../interfaces';
import { GameState } from '../../models/gameState';

/**
 * 標準のターン開始ルール
 * プレイヤーのターン開始時の処理を行う
 */
export class StandardTurnStartRule implements GameRule {
  readonly id = 'standard-turn-start';
  readonly name = '標準ターン開始';
  readonly description = 'プレイヤーのターン開始時の処理を行います';
  readonly type = RuleType.TurnFlow;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns ターン開始アクションなら適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.currentAction?.type === ActionType.TurnStart;
  }

  /**
   * ターン開始時の処理を行う
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state } = context;
    const currentPlayer = state.players[state.currentPlayerIndex];

    // ターン開始イベントを記録
    state.addEvent({
      type: GameEventType.PlayerTurnStarted,
      timestamp: Date.now(),
      data: {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        playerIndex: state.currentPlayerIndex
      }
    });

    // 追加のターン開始処理があればここに実装
  }
}

/**
 * 標準のターン終了ルール
 * プレイヤーのターン終了時の処理を行う
 */
export class StandardTurnEndRule implements GameRule {
  readonly id = 'standard-turn-end';
  readonly name = '標準ターン終了';
  readonly description = 'プレイヤーのターン終了時の処理を行います';
  readonly type = RuleType.TurnFlow;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns ターン終了アクションなら適用可能
   */
  isApplicable(context: GameContext): boolean {
    return context.currentAction?.type === ActionType.TurnEnd;
  }

  /**
   * ターン終了時の処理を行う
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state } = context;
    const currentPlayer = state.players[state.currentPlayerIndex];

    // ターン終了イベントを記録
    state.addEvent({
      type: GameEventType.PlayerTurnEnded,
      timestamp: Date.now(),
      data: {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        playerIndex: state.currentPlayerIndex
      }
    });

    // 次のプレイヤーに順番を移す
    const nextPlayerIndex = state.moveToNextPlayer();

    // 全プレイヤーが1巡したかチェック（最初のプレイヤーに戻った場合）
    if (nextPlayerIndex === 0) {
      this.checkFullRoundCompleted(state);
    }
  }

  /**
   * 全プレイヤーが1巡した後のチェックを行う
   * @param state ゲーム状態
   */
  private checkFullRoundCompleted(state: GameState): void {
    // 混沌レベルが1ラウンドで変更されなかったかチェック
    const roundsSinceChaosModified = state.getMetadata('roundsSinceChaosModified') as number || 0;

    if (roundsSinceChaosModified >= 1) {
      // 停滞ペナルティ：混沌レベルを1増加
      const newChaosLevel = Math.min(3, state.chaosLevel + 1);
      if (newChaosLevel > state.chaosLevel) {
        state.setChaosNotModifiedForFullRound(true);
        state.setMetadata('roundsSinceChaosModified', 0);

        // 混沌レベル変更イベントを記録
        state.addEvent({
          type: GameEventType.ChaosChanged,
          timestamp: Date.now(),
          data: {
            oldValue: state.chaosLevel,
            newValue: newChaosLevel,
            reason: '停滞ペナルティ'
          }
        });

        state.modifyChaosLevel(1, -1); // -1は特殊値でプレイヤーではなくシステムによる変更を示す
      }
    } else {
      // 混沌レベルが変更されていない場合、カウンターを増やす
      state.setMetadata('roundsSinceChaosModified', roundsSinceChaosModified + 1);
    }
  }
}

/**
 * 標準の手札補充ルール
 * アクション後に手札を補充する
 */
export class StandardDrawRule implements GameRule {
  readonly id = 'standard-draw';
  readonly name = '標準手札補充';
  readonly description = 'ターン終了時に手札を1枚補充します';
  readonly type = RuleType.TurnFlow;

  /**
   * このルールが適用可能かどうかを判断する
   * @param context ゲームコンテキスト
   * @returns プレイヤーのアクション完了後で手札が3枚未満なら適用可能
   */
  isApplicable(context: GameContext): boolean {
    if (context.currentAction?.type !== ActionType.TurnEnd) {
      return false;
    }

    const currentPlayer = context.state.players[context.state.currentPlayerIndex];
    return currentPlayer.getHandSize() < 3;
  }

  /**
   * 手札を補充する
   * @param context ゲームコンテキスト
   */
  apply(context: GameContext): void {
    const { state } = context;
    const currentPlayer = state.players[state.currentPlayerIndex];
    const currentHandSize = currentPlayer.getHandSize();

    // 手札が3枚になるまで補充
    const cardsToDrawCount = 3 - currentHandSize;
    if (cardsToDrawCount <= 0) {
      return;
    }

    const drawnCards = state.drawCards(cardsToDrawCount);

    // カードを引いたイベントを記録
    drawnCards.forEach(card => {
      currentPlayer.addCardToHand(card);

      state.addEvent({
        type: GameEventType.CardDrawn,
        timestamp: Date.now(),
        data: {
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          playerIndex: state.currentPlayerIndex,
          cardId: card.id,
          cardName: card.name
        }
      });
    });
  }
}
