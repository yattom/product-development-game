import { Action, ActionType, GameContext } from '../rules/interfaces';
import { GameState } from '../models/gameState';
import { GameFactory } from '../core/factory';
import { CheckVictoryRule, CheckDefeatRule } from '../rules/standard/victory';
import { VictoryConditionType } from '../models/victoryCondition';
import { DefeatConditionType } from '../models/defeatCondition';

// シンプルなインメモリ管理
export type GameHandle = { id: string };

export type Outcome = {
  ended: boolean;
  victory?: {
    type: VictoryConditionType;
    description?: string;
  };
  defeat?: {
    type: DefeatConditionType;
    description?: string;
  };
};

// ゲーム状態の保管庫
const gameStore = new Map<string, GameState>();
let seq = 1;

export function createGame(opts?: { fixture?: string }): GameHandle {
  let state: GameState;

  // 基本状態を生成
  state = GameFactory.createBasicGameState(2);

  // フィクスチャ適用（最小限）
  if (opts?.fixture === 'deckEmptyAndDiscardEmpty') {
    // 山札と捨札を空にする
    state = state.newState({ deck: [], discard: [] });
  }

  const id = `game-${seq++}`;
  gameStore.set(id, state);
  return { id };
}

export function applyAction(game: GameHandle, action: Action): void {
  const current = gameStore.get(game.id);
  if (!current) throw new Error(`Game not found: ${game.id}`);

  // ここでは最小限: TurnEnd/CheckVictory/CheckDefeat のみ扱う
  const context: GameContext = {
    state: current,
    currentAction: action,
    metadata: {},
  };

  let newState = current;

  // 勝利チェック
  const checkVictory = new CheckVictoryRule();
  if (checkVictory.isApplicable(context)) {
    newState = checkVictory.apply({ ...context, state: newState });
  }

  // 敗北チェック
  const checkDefeat = new CheckDefeatRule();
  if (checkDefeat.isApplicable(context)) {
    newState = checkDefeat.apply({ ...context, state: newState });
  }

  gameStore.set(game.id, newState);
}

export function getOutcome(game: GameHandle): Outcome {
  const state = gameStore.get(game.id);
  if (!state) throw new Error(`Game not found: ${game.id}`);

  const ended = state.getMetadata('gameOver') === true;

  // 直近の勝利/敗北イベントを検索
  const victoryEvent = [...state.eventHistory].reverse().find(e => e.type === 'VICTORY_ACHIEVED');
  const defeatEvent = [...state.eventHistory].reverse().find(e => e.type === 'DEFEAT_TRIGGERED');

  const outcome: Outcome = { ended };

  if (victoryEvent) {
    outcome.victory = {
      type: victoryEvent.data.conditionType as VictoryConditionType,
      description: victoryEvent.data.conditionDescription,
    };
  }

  if (defeatEvent) {
    outcome.defeat = {
      type: defeatEvent.data.conditionType as DefeatConditionType,
      description: defeatEvent.data.conditionDescription,
    };
  }

  return outcome;
}
