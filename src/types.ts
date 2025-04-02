export interface Poem {
  id: string;
  title: string;
  content: string;
}

export interface ImageryCount {
  word: string;
  count: number;
}

export interface ProcessedPoem {
  id: string;
  title: string;
  content: string;
  imagery: ImageryItem[];
  wordAssociations: WordAssociation[];
  emotionAnalysis?: EmotionAnalysis;
}

export interface CoOccurrence {
  source: string;
  target: string;
  value: number;
}

export interface TimelineData {
  imagery: string;
  counts: number[];
}

export interface CategoryData {
  category: string;
  imageryCount: { [key: string]: number };
}

export interface WordRelationship {
  imagery: string;
  word: string;
  count: number;
}

export interface WordAssociation {
  word: string;
  count: number;
  strength: number;
  occurrences: Array<{
    poemId: string;
    sentence: string;
  }>;
}

export interface GlobalStats {
  coOccurrenceNetwork: {
    nodes: Array<{ name: string; value: number; category: string }>;
    links: Array<{ 
      source: string; 
      target: string; 
      value: number;
      lineStyle: {
        width: number;
        color: string;
      };
    }>;
    categories: Array<{ name: string }>;
  };
  timeline: TimelineData[];
  categoryAnalysis: CategoryData[];
  topPairs: Array<{ pair: string[]; count: number }>;
  wordRelationships: WordRelationship[];
  imageryWordNetwork: {
    nodes: Array<{ name: string; value: number; category: string }>;
    links: Array<{
      source: string;
      target: string;
      value: number;
      lineStyle: {
        width: number;
        color: string;
      };
    }>;
  };
  imageryEmotionNetwork?: {
    nodes: Array<{ name: string; value: number; category: string }>;
    links: Array<{
      source: string;
      target: string;
      value: number;
      lineStyle: {
        width: number;
        color: string;
      };
    }>;
  };
}

export interface AISettings {
  model: string;
  apiKey: string;
  useAI: boolean;
}

export interface EmotionAnalysis {
  imageryEmotions: Array<{
    imagery: string;
    emotion: string;
    tendency: '积极' | '消极' | '中性';
    intensity: number;
  }>;
}

export interface ImageryEmotionPair {
  imagery: string;
  sentence: string;
  emotion: EmotionAnalysis;
}

export interface ImageryItem {
  word: string;
  count: number;
}

export interface ImageryWordPair {
  imagery: string;
  word: string;
  count: number;
  occurrences: Array<{
    poemId: string;
    sentence: string;
  }>;
}