import { 
  cards, Card, InsertCard, 
  reviews, Review, InsertReview,
  subjects, Subject, InsertSubject,
  CardWithReview
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private cards: Map<number, Card>;
  private reviews: Map<number, Review>;
  private subjects: Map<number, Subject>;
  private cardIdCounter: number;
  private reviewIdCounter: number;
  private subjectIdCounter: number;

  constructor() {
    this.cards = new Map();
    this.reviews = new Map();
    this.subjects = new Map();
    this.cardIdCounter = 1;
    this.reviewIdCounter = 1;
    this.subjectIdCounter = 1;
    
    // Add default subjects
    const defaultSubjects = [
      "作業系統", "機器學習", "歷史", "物理", "生物", 
      "程式開發", "線性代數", "計算機組織", "語言", 
      "資料結構與演算法", "離散數學"
    ];
    
    defaultSubjects.forEach(name => {
      this.createSubject({ name });
    });
  }

  // Card operations
  async getAllCards(): Promise<CardWithReview[]> {
    const allCards = Array.from(this.cards.values());
    
    return allCards.map(card => {
      const cardReviews = Array.from(this.reviews.values())
        .filter(review => review.cardId === card.id)
        .sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime());
      
      return {
        ...card,
        lastReview: cardReviews.length > 0 ? cardReviews[0] : undefined
      };
    });
  }

  async getCardById(id: number): Promise<CardWithReview | undefined> {
    const card = this.cards.get(id);
    if (!card) return undefined;
    
    const cardReviews = Array.from(this.reviews.values())
      .filter(review => review.cardId === id)
      .sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime());
    
    return {
      ...card,
      lastReview: cardReviews.length > 0 ? cardReviews[0] : undefined
    };
  }

  async createCard(card: InsertCard): Promise<Card> {
    const id = this.cardIdCounter++;
    const createdAt = new Date();
    const newCard: Card = { ...card, id, createdAt };
    this.cards.set(id, newCard);
    return newCard;
  }

  async updateCard(id: number, card: Partial<InsertCard>): Promise<Card | undefined> {
    const existingCard = this.cards.get(id);
    if (!existingCard) return undefined;

    const updatedCard = { ...existingCard, ...card };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }

  async deleteCard(id: number): Promise<boolean> {
    if (!this.cards.has(id)) return false;
    
    // Delete all reviews for this card
    Array.from(this.reviews.entries())
      .filter(([_, review]) => review.cardId === id)
      .forEach(([reviewId]) => this.reviews.delete(reviewId));
    
    return this.cards.delete(id);
  }

  // Review operations
  async getReviewsByCardId(cardId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.cardId === cardId)
      .sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime());
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const newReview: Review = { ...review, id };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async getCardsForReview(date: Date): Promise<CardWithReview[]> {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    
    const cardsWithReviews = await this.getAllCards();
    
    return cardsWithReviews.filter(card => {
      if (!card.lastReview) return true; // Cards that have never been reviewed
      
      const nextReviewDate = new Date(card.lastReview.nextReviewDate);
      nextReviewDate.setHours(0, 0, 0, 0);
      
      return nextReviewDate.getTime() <= today.getTime();
    });
  }

  // Subject operations
  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    // Check if subject already exists
    const existingSubject = Array.from(this.subjects.values())
      .find(s => s.name.toLowerCase() === subject.name.toLowerCase());
    
    if (existingSubject) {
      return existingSubject;
    }
    
    const id = this.subjectIdCounter++;
    const newSubject: Subject = { ...subject, id };
    this.subjects.set(id, newSubject);
    return newSubject;
  }

  async deleteSubject(id: number): Promise<boolean> {
    return this.subjects.delete(id);
  }

  // Statistics
  async getCardStats(): Promise<{
    totalCards: number;
    cardsToReviewToday: number;
    completedToday: number;
    dueSoon: number;
    avgFamiliarity: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekFromToday = new Date(today);
    oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);
    
    const cardsToReview = await this.getCardsForReview(today);
    
    // Cards reviewed today
    const todayReviews = Array.from(this.reviews.values()).filter(review => {
      const reviewDate = new Date(review.reviewDate);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate.getTime() === today.getTime();
    });
    
    // Get unique card IDs reviewed today
    const reviewedCardIdsToday = new Set(todayReviews.map(review => review.cardId));
    
    // Cards due soon (in the next 7 days, excluding today)
    const cardsDueSoon = (await this.getAllCards()).filter(card => {
      if (!card.lastReview) return false;
      
      const nextReviewDate = new Date(card.lastReview.nextReviewDate);
      nextReviewDate.setHours(0, 0, 0, 0);
      
      return nextReviewDate.getTime() > today.getTime() && 
             nextReviewDate.getTime() <= oneWeekFromToday.getTime();
    });
    
    // Calculate average familiarity
    let totalFamiliarity = 0;
    let familiarityCount = 0;
    
    (await this.getAllCards()).forEach(card => {
      if (card.lastReview) {
        totalFamiliarity += card.lastReview.familiarityScore;
        familiarityCount++;
      }
    });
    
    const avgFamiliarity = familiarityCount > 0 
      ? parseFloat((totalFamiliarity / familiarityCount).toFixed(1)) 
      : 0;
    
    return {
      totalCards: this.cards.size,
      cardsToReviewToday: cardsToReview.length,
      completedToday: reviewedCardIdsToday.size,
      dueSoon: cardsDueSoon.length,
      avgFamiliarity
    };
  }

  async getSubjectDistribution(): Promise<{ subject: string; count: number }[]> {
    const subjects = await this.getAllSubjects();
    const distribution = subjects.map(subject => {
      const count = Array.from(this.cards.values())
        .filter(card => card.subject === subject.name)
        .length;
      
      return {
        subject: subject.name,
        count
      };
    });
    
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

export const storage = new MemStorage();
