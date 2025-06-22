import { Category } from '../rules/interfaces';
import { Card } from '../models/card';
import { Player } from '../models/player';
import { GameState } from '../models/gameState';
import { VictoryCondition, VictoryConditionType } from '../models/victoryCondition';
import { DefeatCondition, DefeatConditionType } from '../models/defeatCondition';
import { standardRuleSet } from '../rules/standard';

/**
 * ゲームファクトリクラス
 * ゲームの初期状態や要素を作成するためのユーティリティクラス
 */
export class GameFactory {
  /**
   * 基本的なゲーム状態を作成する
   * @param playerCount プレイヤー数
   * @returns 初期化されたゲーム状態
   */
  static createBasicGameState(playerCount: number = 2): GameState {
    // デフォルトのカードデッキを作成
    const deck = this.createDefaultDeck();
    
    // プレイヤーを作成
    const players = Array.from({ length: playerCount }, (_, i) => 
      new Player({
        id: `player-${i + 1}`,
        name: `プレイヤー${i + 1}`,
        hand: []
      })
    );
    
    // 勝利条件を作成
    const victoryConditions = [
      VictoryCondition.createStandard(VictoryConditionType.BalancedProduct)
    ];
    
    // 敗北条件を作成
    const defeatConditions = [
      DefeatCondition.createStandard(DefeatConditionType.DeckDepletion),
      DefeatCondition.createStandard(DefeatConditionType.ChaosOverflow),
      DefeatCondition.createStandard(DefeatConditionType.StagnationPenalty)
    ];
    
    // ゲーム状態を作成して返す
    return new GameState({
      players,
      currentPlayerIndex: 0,
      deck,
      activeRuleSet: standardRuleSet,
      victoryConditions,
      defeatConditions,
      chaosLevel: 0,
      resources: 0
    });
  }

  /**
   * デフォルトのカードデッキを作成する
   * @returns カードの配列
   */
  static createDefaultDeck(): Card[] {
    const cards: Card[] = [];
    let cardId = 1;
    
    // テクノロジーカード
    this.addResourceCards(cards, Category.Technology, cardId);
    cardId += 12;
    
    // ユーザーカード
    this.addResourceCards(cards, Category.User, cardId);
    cardId += 12;
    
    // マネジメントカード
    this.addResourceCards(cards, Category.Management, cardId);
    cardId += 12;
    
    // 特殊効果カード
    this.addSpecialCards(cards, cardId);
    
    return this.shuffleDeck([...cards]);
  }

  /**
   * リソースカードを追加する
   * @param cards カードを追加する配列
   * @param category カードのカテゴリ
   * @param startId 開始ID
   */
  private static addResourceCards(cards: Card[], category: Category, startId: number): void {
    // リソースカード（+1, +2, +3）を各2枚ずつ追加
    for (let i = 1; i <= 3; i++) {
      for (let j = 0; j < 2; j++) {
        cards.push(new Card({
          id: `card-${startId++}`,
          name: `${this.getCategoryName(category)}の成功 +${i}`,
          description: `${this.getCategoryName(category)}における成功をもたらします。リソース+${i}`,
          categories: [category],
          situationEffect: i
        }));
      }
    }
    
    // トラブルカード（-1, -2, -3）を各2枚ずつ追加
    for (let i = 1; i <= 3; i++) {
      for (let j = 0; j < 2; j++) {
        cards.push(new Card({
          id: `card-${startId++}`,
          name: `${this.getCategoryName(category)}のトラブル -${i}`,
          description: `${this.getCategoryName(category)}における問題が発生します。リソース-${i}`,
          categories: [category],
          situationEffect: -i
        }));
      }
    }
  }

  /**
   * 特殊効果カードを追加する
   * @param cards カードを追加する配列
   * @param startId 開始ID
   */
  private static addSpecialCards(cards: Card[], startId: number): void {
    // 会社がM&Aされる
    cards.push(new Card({
      id: `card-${startId++}`,
      name: '会社がM&Aされる',
      description: '突然の合併買収が発表された！置き場にリソース2以上のカードがあればリソース+1、無ければ混沌ダイス+1',
      categories: [Category.Management],
      situationEffect: -1,
      playEffect: {
        ruleId: 'effect-special-ma',
        params: {},
        description: '置き場にリソース2以上のカードがあればリソース+1、無ければ混沌ダイス+1'
      }
    }));
    
    // プロダクトが熱烈にほめられる
    cards.push(new Card({
      id: `card-${startId++}`,
      name: 'プロダクトが熱烈にほめられる',
      description: 'ユーザーから絶賛の声が届いた！テクノロジーカテゴリにリソース1以上のカードがあればリソース+2（最大3）',
      categories: [Category.User],
      situationEffect: 2,
      playEffect: {
        ruleId: 'effect-special-praise',
        params: {},
        description: 'テクノロジーカテゴリにリソース1以上のカードがあればリソース+2（最大3）'
      }
    }));
    
    // 一方的に納期が短縮される
    cards.push(new Card({
      id: `card-${startId++}`,
      name: '一方的に納期が短縮される',
      description: '上層部から突然の納期短縮命令！置き場の最も状況値が高いカードを捨てる',
      categories: [Category.Management],
      situationEffect: -3,
      playEffect: {
        ruleId: 'effect-special-deadline',
        params: {},
        description: '置き場の最も状況値が高いカードを捨てる'
      }
    }));
    
    // さらに特殊カードを追加...
  }

  /**
   * カテゴリ名を取得する
   * @param category カテゴリ
   * @returns カテゴリの日本語名
   */
  private static getCategoryName(category: Category): string {
    switch (category) {
      case Category.Technology:
        return 'テクノロジー';
      case Category.User:
        return 'ユーザー';
      case Category.Management:
        return 'マネジメント';
      default:
        return '不明';
    }
  }

  /**
   * デッキをシャッフルする
   * @param deck シャッフルするデッキ
   * @returns シャッフルされたデッキ
   */
  private static shuffleDeck(deck: Card[]): Card[] {
    // Fisher-Yatesアルゴリズムでシャッフル
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
}