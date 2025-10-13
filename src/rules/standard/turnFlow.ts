import {ActionType, GameContext, GameEventType, GameRule, RuleType} from '../interfaces';
import {GameState} from '../../models/gameState';

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
   * @returns 新しいGameState
   */
  apply(context: GameContext): GameState {
    const { state } = context;
    const currentPlayer = state.players[state.currentPlayerIndex];

    // ターン開始イベントを記録
    return state.addEvent({
      type: GameEventType.PlayerTurnStarted,
      timestamp: Date.now(),
      data: {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        playerIndex: state.currentPlayerIndex
      }
    });
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
   * @returns 新しいGameState
   */
  apply(context: GameContext): GameState {
    const { state } = context;
    const currentPlayer = state.players[state.currentPlayerIndex];

    // ターン終了イベントを記録
    let currentState = state.addEvent({
      type: GameEventType.PlayerTurnEnded,
      timestamp: Date.now(),
      data: {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        playerIndex: state.currentPlayerIndex
      }
    });

    // 次のプレイヤーに順番を移す
    currentState = currentState.moveToNextPlayer();

    // 全プレイヤーが1巡したかチェック（最初のプレイヤーに戻った場合）
    if (currentState.currentPlayerIndex === 0) {
      currentState = this.checkFullRoundCompleted(currentState);
    }

    return currentState;
  }

  /**
   * 全プレイヤーが1巡した後のチェックを行う
   * @param state ゲーム状態
   * @returns 新しいGameState
   */
  private checkFullRoundCompleted(state: GameState): GameState {
    // 混沌レベルが1ラウンドで変更されなかったかチェック
    const roundsSinceChaosModified = state.getMetadata('roundsSinceChaosModified') as number || 0;

    if (roundsSinceChaosModified >= 1) {
      // 停滞ペナルティ：混沌レベルを1増加
      const newChaosLevel = Math.min(3, state.chaosLevel + 1);
      if (newChaosLevel > state.chaosLevel) {
        let currentState = state.setChaosNotModifiedForFullRound(true);
        currentState = currentState.setMetadata('roundsSinceChaosModified', 0);

        // 混沌レベル変更イベントを記録
        currentState = currentState.addEvent({
          type: GameEventType.ChaosChanged,
          timestamp: Date.now(),
          data: {
            oldValue: state.chaosLevel,
            newValue: newChaosLevel,
            reason: '停滞ペナルティ'
          }
        });

        return currentState.automaticChaosLevelIncrease();
      }
    } else {
      // 混沌レベルが変更されていない場合、カウンターを増やす
      return state.setMetadata('roundsSinceChaosModified', roundsSinceChaosModified + 1);
    }
    
    return state;
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
   * 手札を補充する（イミュータブル版）
   * @param context ゲームコンテキスト
   * @returns 新しいGameState
   */
  apply(context: GameContext): GameState {
    const { state } = context;
    let currentState = state;
    let currentPlayer = currentState.players[currentState.currentPlayerIndex];

    // 手札が3枚になるまで、1枚ずつドローして反映
    while (currentPlayer.getHandSize() < 3) {
      const { drawnCards, state: afterDrawState } = currentState.drawCards(1);
      if (drawnCards.length === 0) {
        // 山札・捨て札ともに尽きた
        break;
      }

      const card = drawnCards[0];
      const updatedPlayer = currentPlayer.addCardToHand(card);
      const newPlayers = currentState.players.map((p, i) =>
        i === currentState.currentPlayerIndex ? updatedPlayer : p
      );

      // プレイヤー差し替えとイベント追記
      currentState = afterDrawState
        .newState({ players: newPlayers })
        .addEvent({
          type: GameEventType.CardDrawn,
          timestamp: Date.now(),
          data: {
            playerId: updatedPlayer.id,
            playerName: updatedPlayer.name,
            playerIndex: currentState.currentPlayerIndex,
            cardId: card.id,
            cardName: card.name
          }
        });

      currentPlayer = updatedPlayer;
    }

    return currentState;
  }
}
