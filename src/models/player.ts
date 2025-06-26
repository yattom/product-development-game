import {Card} from './card';

/**
 * プレイヤークラス
 * ゲーム内のプレイヤーを表現する
 */
export class Player {
  /** プレイヤーの一意識別子 */
  readonly id: string;
  
  /** プレイヤーの名前 */
  readonly name: string;
  
  /** プレイヤーの手札 */
  private _hand: Card[];
  
  /** プレイヤー固有のメタデータ */
  private _metadata: Record<string, any>;

  /**
   * プレイヤーを作成する
   */
  constructor(params: {
    id: string;
    name: string;
    hand?: Card[];
    metadata?: Record<string, any>;
  }) {
    this.id = params.id;
    this.name = params.name;
    this._hand = params.hand || [];
    this._metadata = params.metadata || {};
  }

  /**
   * プレイヤーの手札を取得する
   */
  get hand(): Card[] {
    return [...this._hand];
  }

  /**
   * プレイヤーのメタデータを取得する
   */
  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  /**
   * プレイヤーの手札にカードを追加する
   * @param card 追加するカード
   */
  addCardToHand(card: Card): void {
    this._hand.push(card);
  }

  /**
   * プレイヤーの手札からカードを削除する
   * @param cardId 削除するカードのID
   * @returns 削除されたカード、見つからない場合はundefined
   */
  removeCardFromHand(cardId: string): Card {
    const index = this._hand.findIndex(card => card.id === cardId);
    if (index === -1) {
      throw new Error(`Card with id ${cardId} not found in player's hand`);
    }
    return this._hand.splice(index, 1)[0];
  }

  /**
   * プレイヤーの手札からカードを指定のインデックスで削除する
   * @param index 削除するカードのインデックス
   * @returns 削除されたカード、インデックスが無効な場合はundefined
   */
  removeCardFromHandByIndex(index: number): Card | undefined {
    if (index < 0 || index >= this._hand.length) {
      return undefined;
    }
    return this._hand.splice(index, 1)[0];
  }

  /**
   * プレイヤーの手札のカード数を取得する
   */
  getHandSize(): number {
    return this._hand.length;
  }

  /**
   * メタデータを設定する
   * @param key メタデータのキー
   * @param value メタデータの値
   */
  setMetadata(key: string, value: any): void {
    this._metadata[key] = value;
  }

  /**
   * メタデータを取得する
   * @param key メタデータのキー
   * @returns メタデータの値、キーが存在しない場合はundefined
   */
  getMetadata<T>(key: string): T | undefined {
    return this._metadata[key] as T | undefined;
  }

  /**
   * プレイヤーのクローンを作成する
   * 主にテスト用
   */
  clone(): Player {
    return new Player({
      id: this.id,
      name: this.name,
      hand: this._hand.map(card => card.clone()),
      metadata: { ...this._metadata }
    });
  }
}