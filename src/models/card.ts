import { Category, PlayEffect } from '../rules/interfaces';

/**
 * カードクラス
 * ゲーム内のカードを表現する
 */
export class Card {
  /** カードの一意識別子 */
  readonly id: string;
  
  /** カードの名前 */
  readonly name: string;
  
  /** カードの説明文 */
  readonly description: string;
  
  /** カードのカテゴリ */
  readonly categories: Category[];
  
  /** 
   * カードの状況効果（リソースへの影響）
   * -3から+3の範囲で表す
   */
  readonly situationEffect: number;
  
  /** 
   * カードのプレイ効果
   * 手札からプレイした時に発動する効果
   */
  readonly playEffect?: PlayEffect;

  /**
   * カードを作成する
   */
  constructor(params: {
    id: string;
    name: string;
    description: string;
    categories: Category[];
    situationEffect: number;
    playEffect?: PlayEffect;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.categories = [...params.categories];
    this.situationEffect = params.situationEffect;
    this.playEffect = params.playEffect;
    
    // 状況効果値のバリデーション
    if (this.situationEffect < -3 || this.situationEffect > 3) {
      throw new Error(`Invalid situationEffect value: ${this.situationEffect}. Must be between -3 and 3.`);
    }
  }

  /**
   * カードが指定されたカテゴリに属しているかを確認する
   */
  hasCategory(category: Category): boolean {
    return this.categories.includes(category);
  }

  /**
   * カードがリソースカードかどうかを確認する
   * 状況効果が正の値のカードはリソースカード
   */
  isResourceCard(): boolean {
    return this.situationEffect > 0;
  }

  /**
   * カードがトラブルカードかどうかを確認する
   * 状況効果が負の値のカードはトラブルカード
   */
  isTroubleCard(): boolean {
    return this.situationEffect < 0;
  }

  /**
   * カードが中立カードかどうかを確認する
   * 状況効果が0のカードは中立カード
   */
  isNeutralCard(): boolean {
    return this.situationEffect === 0;
  }

  /**
   * カードのプレイ効果があるかどうかを確認する
   */
  hasPlayEffect(): boolean {
    return !!this.playEffect;
  }

  /**
   * カードのクローンを作成する
   * 主にテスト用
   */
  clone(): Card {
    return new Card({
      id: this.id,
      name: this.name,
      description: this.description,
      categories: [...this.categories],
      situationEffect: this.situationEffect,
      playEffect: this.playEffect ? { ...this.playEffect } : undefined
    });
  }
}