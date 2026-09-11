export interface RoundData {
  roundNumber: number;
  title: string;
  theme: string;
  artistAct: string;
  genre: string;
  venueType: string;
  promotionLevel: number;
  venuePrestige: number;
  weather: string;
  concertDay: string;
  competingEvents: string;
  instructions: string;
  status: string;
  timerSeconds: number;
}

export interface SubmissionResult {
  predictedGa: number;
  predictedVip: number;
  actualGa?: number;
  actualVip?: number;
  gaError?: number;
  vipError?: number;
  accuracy?: number;
  score?: number;
}

export interface GameResults {
  totalScore: number;
  submissions: SubmissionResult[];
}

export interface TrainingMatch {
  matchId: string;
  year: number;
  month: number;
  artistAct: string;
  genre: string;
  venueType: string;
  promotionLevel: number;
  venuePrestige: number;
  weather: string;
  concertDay: string;
  competingEvents: string;
  actualGa: number;
  actualVip: number;
}

export interface TeamData {
  id: string;
  name: string;
  teamCode: string;
  currentRound: number;
  totalScore: number;
  status: string;
}

export const ROUND_THEMES: Record<number, { name: string; code: string; emoji: string; color: string }> = {
  1: { name: 'Open-Air Baseline', code: 'T061', emoji: '☀️', color: '#17D059' },
  2: { name: 'Holiday Surge & Competition', code: 'T062', emoji: '🎉', color: '#2563EB' },
  3: { name: 'Prestige Weekend Showcase', code: 'T063', emoji: '🏛️', color: '#7C3AED' },
  4: { name: 'Indoor Hall Clash', code: 'T064', emoji: '⚡', color: '#DC2626' },
  5: { name: 'High Promo / Entry Venue', code: 'T065', emoji: '📢', color: '#EA580C' },
  6: { name: 'Solo Arena Grand Finale', code: 'T066', emoji: '🏆', color: '#F59E0B' }
};

export const HOW_IT_WORKS_STEPS = [
  "Analyze the 60 historical events & demand drivers",
  "Evaluate round parameters (Artist, Venue, Promo, Weather, Day, Competition)",
  "Submit Basic (0–50k) & Premium (0–10k) occupancy forecasts + written reasoning",
  "Score on 60% Forecast Accuracy + 40% Analytical Logic & Strategy"
];

