export interface BiasAnalysis {
  rating: string;
  explanation: string;
}

export interface NLPBreakdown {
  sentiment: string;
  sophistication: string;
  logicalFallacies: string[];
  propagandaLikelihood: number; // 0-100
  emotionalIntensity: number; // 0-100
  lexicalDensity: number; // 0-100
}

export interface FactualCheck {
  claim: string;
  status: 'Verified' | 'Contested' | 'False' | 'Unverifiable';
  details: string;
}

export interface TrustedSource {
  name: string;
  url: string;
  reason: string;
}

export interface AnalysisResult {
  credibilityScore: number;
  verdict: string;
  biasAnalysis: BiasAnalysis;
  nlpBreakdown: NLPBreakdown;
  factualChecks: FactualCheck[];
  trustedSources: TrustedSource[];
}
