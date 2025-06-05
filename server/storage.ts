import { 
  cards, Card, InsertCard, 
  reviews, Review, InsertReview,
  subjects, Subject, InsertSubject,
  CardWithReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, lte, gte, count, avg, desc } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // Card operations
  getAllCards(): Promise<CardWithReview[]>;
  getCardById(id: number): Promise<CardWithReview | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, card: Partial<InsertCard>): Promise<Card | undefined>;
  deleteCard(id: number): Promise<boolean>;
  
  // Review operations
  getReviewsByCardId(cardId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getCardsForReview(date: Date): Promise<CardWithReview[]>;
  
  // Subject operations
  getAllSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  deleteSubject(id: number): Promise<boolean>;
  
  // Statistics
  getCardStats(): Promise<{
    totalCards: number;
    cardsToReviewToday: number;
    completedToday: number;
    dueSoon: number;
    avgFamiliarity: number;
  }>;
  getSubjectDistribution(): Promise<{ subject: string; count: number }[]>;
  getFamiliarityDistribution(): Promise<{ level: number; count: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async initializeDefaultSubjects() {
    // 首先檢查是否已經有科目存在
    const existingSubjects = await this.getAllSubjects();
    if (existingSubjects.length > 0) {
      return; // 如果已經有科目，就不初始化默認科目
    }

    const defaultSubjects = [
      "作業系統", "機器學習", "歷史", "物理", "生物", 
      "程式開發", "線性代數", "計算機組織", "語言", 
      "資料結構與演算法", "離散數學"
    ];
    
    for (const name of defaultSubjects) {
      await this.createSubject({ name });
    }
  }

  // Card operations
  async getAllCards(): Promise<CardWithReview[]> {
    const allCards = await db.select().from(cards);
    
    const cardsWithReviews: CardWithReview[] = [];
    
    for (const card of allCards) {
      const cardReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.cardId, card.id))
        .orderBy(desc(reviews.reviewDate));
      
      cardsWithReviews.push({
        ...card,
        lastReview: cardReviews.length > 0 ? cardReviews[0] : undefined
      });
    }
    
    return cardsWithReviews;
  }

  async getCardById(id: number): Promise<CardWithReview | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    if (!card) return undefined;
    
    const cardReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.cardId, id))
      .orderBy(desc(reviews.reviewDate));
    
    return {
      ...card,
      lastReview: cardReviews.length > 0 ? cardReviews[0] : undefined
    };
  }

  async createCard(card: InsertCard): Promise<Card> {
    const [newCard] = await db
      .insert(cards)
      .values(card)
      .returning();
    return newCard;
  }

  async updateCard(id: number, card: Partial<InsertCard>): Promise<Card | undefined> {
    const [updatedCard] = await db
      .update(cards)
      .set(card)
      .where(eq(cards.id, id))
      .returning();
    
    return updatedCard || undefined;
  }

  async deleteCard(id: number): Promise<boolean> {
    // Delete all reviews for this card first
    await db.delete(reviews).where(eq(reviews.cardId, id));
    
    // Delete the card
    const result = await db.delete(cards).where(eq(cards.id, id));
    return result.rowCount > 0;
  }

  // Review operations
  async getReviewsByCardId(cardId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.cardId, cardId))
      .orderBy(desc(reviews.reviewDate));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getCardsForReview(date: Date): Promise<CardWithReview[]> {
    const today = date.toISOString().split('T')[0];
    
    const cardsWithReviews = await this.getAllCards();
    
    return cardsWithReviews.filter(card => {
      if (!card.lastReview) return true; // Cards that have never been reviewed
      
      return card.lastReview.nextReviewDate <= today;
    });
  }

  // Subject operations
  async getAllSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    // Check if subject already exists
    const existingSubjects = await db
      .select()
      .from(subjects)
      .where(eq(subjects.name, subject.name));
    
    if (existingSubjects.length > 0) {
      return existingSubjects[0];
    }
    
    const [newSubject] = await db
      .insert(subjects)
      .values(subject)
      .returning();
    return newSubject;
  }

  async deleteSubject(id: number): Promise<boolean> {
    const result = await db.delete(subjects).where(eq(subjects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Statistics
  async getCardStats(): Promise<{
    totalCards: number;
    cardsToReviewToday: number;
    completedToday: number;
    dueSoon: number;
    avgFamiliarity: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const oneWeekFromToday = new Date();
    oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);
    const weekFromTodayStr = oneWeekFromToday.toISOString().split('T')[0];
    
    // Get total cards count
    const totalCardsResult = await db.select({ count: count() }).from(cards);
    const totalCards = totalCardsResult[0]?.count || 0;
    
    // Get cards to review today
    const cardsToReview = await this.getCardsForReview(new Date());
    
    // Cards reviewed today
    const todayReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.reviewDate, today));
    
    // Get unique card IDs reviewed today
    const reviewedCardIdsToday = new Set(todayReviews.map(review => review.cardId));
    
    // Cards due soon (in the next 7 days, excluding today)
    const cardsDueSoon = (await this.getAllCards()).filter(card => {
      if (!card.lastReview) return false;
      
      return card.lastReview.nextReviewDate > today && 
             card.lastReview.nextReviewDate <= weekFromTodayStr;
    });
    
    // Calculate average familiarity
    const allCards = await this.getAllCards();
    let totalFamiliarity = 0;
    let familiarityCount = 0;
    
    allCards.forEach(card => {
      if (card.lastReview) {
        totalFamiliarity += card.lastReview.familiarityScore;
        familiarityCount++;
      }
    });
    
    const avgFamiliarity = familiarityCount > 0 
      ? parseFloat((totalFamiliarity / familiarityCount).toFixed(1)) 
      : 0;
    
    return {
      totalCards,
      cardsToReviewToday: cardsToReview.length,
      completedToday: reviewedCardIdsToday.size,
      dueSoon: cardsDueSoon.length,
      avgFamiliarity
    };
  }

  async getSubjectDistribution(): Promise<{ subject: string; count: number }[]> {
    const subjectsList = await this.getAllSubjects();
    const distribution = [];
    
    for (const subject of subjectsList) {
      const cardCount = await db
        .select({ count: count() })
        .from(cards)
        .where(eq(cards.subject, subject.name));
      
      distribution.push({
        subject: subject.name,
        count: cardCount[0]?.count || 0
      });
    }
    
    return distribution;
  }

  async getFamiliarityDistribution(): Promise<{ level: number; count: number }[]> {
    const distribution = [
      { level: 1, count: 0 },
      { level: 2, count: 0 },
      { level: 3, count: 0 },
      { level: 4, count: 0 },
      { level: 5, count: 0 }
    ];
    
    const cardsWithReviews = await this.getAllCards();
    
    cardsWithReviews.forEach(card => {
      if (card.lastReview) {
        const level = card.lastReview.familiarityScore;
        if (level >= 1 && level <= 5) {
          distribution[level - 1].count++;
        }
      }
    });
    
    return distribution;
  }
}

const databaseStorage = new DatabaseStorage();

// Initialize default subjects when the storage is created
databaseStorage.initializeDefaultSubjects().catch(console.error);

export const storage = databaseStorage;
