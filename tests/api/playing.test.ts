import { ActionType } from '../../src/rules/interfaces';

// まだ存在しない最小API（TDDのRED）
import { createGame, applyAction, getOutcome } from '../../src/api/gameApi';

/**
 * ゲームAPI – 最小のエンドツーエンドフロー（TDD: RED）
 */
describe('Game playing – minimal end-to-end flows', () => {
  it('山札切れ: ターン終了で敗北となる', () => {
    // フィクスチャで山札/捨て札とも空の特殊初期状態を用意
    const game = createGame({ fixture: 'deckEmptyAndDiscardEmpty' });

    // ルール仕様に合わせて、TurnEndで敗北チェックが走る前提
    applyAction(game, { type: ActionType.TurnEnd, payload: {} });

    const outcome = getOutcome(game);
    expect(outcome.ended).toBe(true);
    expect(outcome.victory).toBeUndefined();
    // 敗北理由は山札切れ
    expect(outcome.defeat?.type).toBe('DECK_DEPLETION');
  });
});
