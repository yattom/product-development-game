import { Player } from '../../src/models/player';
import { createTestCard } from '../fixture/create_helper';

describe('Player', () => {
  describe('イミュータブルメソッド', () => {
    it('addCardToHandがイミュータブルな新しいPlayerを返す', () => {
      // Arrange
      const player = new Player({
        id: 'test-player',
        name: 'Test Player',
        hand: [],
        metadata: {}
      });
      const card = createTestCard();

      // Act
      const newPlayer = player.addCardToHand(card);

      // Assert
      // 新しいPlayerインスタンスが返されている
      expect(newPlayer).not.toBe(player);
      
      // 新しいPlayerに手札が追加されている
      expect(newPlayer.getHandSize()).toBe(1);
      expect(newPlayer.hand).toContain(card);
      
      // 元のPlayerは変更されていない
      expect(player.getHandSize()).toBe(0);
      expect(player.hand).not.toContain(card);
    });

    it('removeCardFromHandがイミュータブルな新しいPlayerを返す', () => {
      // Arrange
      const card = createTestCard();
      const player = new Player({
        id: 'test-player',
        name: 'Test Player',
        hand: [card],
        metadata: {}
      });

      // Act
      const { newPlayer, removedCard } = player.removeCardFromHand(card.id);

      // Assert
      // 新しいPlayerインスタンスが返されている
      expect(newPlayer).not.toBe(player);
      
      // カードが削除されている
      expect(newPlayer.getHandSize()).toBe(0);
      expect(newPlayer.hand).not.toContain(card);
      
      // 削除されたカードが返されている
      expect(removedCard).toBe(card);
      
      // 元のPlayerは変更されていない
      expect(player.getHandSize()).toBe(1);
      expect(player.hand).toContain(card);
    });
  });
});