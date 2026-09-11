export interface ScoreResult {
  gaError: number;      // signed relative error
  vipError: number;     // signed relative error
  accuracy: number;     // 0-100 percentage
  score: number;        // 0-maxRoundScore points
}

export function calculateScore(
  predictedGa: number,
  predictedVip: number,
  actualGa: number,
  actualVip: number,
  config: {
    gaWeight: number;
    vipWeight: number;
    maxRoundScore: number;
    underForecastPenalty: number;
    overForecastPenalty: number;
  }
): ScoreResult {
  const rawGaError = (predictedGa - actualGa) / actualGa;
  const rawVipError = (predictedVip - actualVip) / actualVip;
  const gaPenalty = predictedGa > actualGa ? config.overForecastPenalty : config.underForecastPenalty;
  const vipPenalty = predictedVip > actualVip ? config.overForecastPenalty : config.underForecastPenalty;
  const gaAccuracy = Math.max(0, 1 - Math.abs(rawGaError) * gaPenalty);
  const vipAccuracy = Math.max(0, 1 - Math.abs(rawVipError) * vipPenalty);
  const totalWeight = config.gaWeight + config.vipWeight;
  const normalizedAccuracy = (gaAccuracy * config.gaWeight + vipAccuracy * config.vipWeight) / totalWeight;
  const accuracy = normalizedAccuracy * 100;
  const score = Math.round(normalizedAccuracy * config.maxRoundScore);

  return {
    gaError: rawGaError,
    vipError: rawVipError,
    accuracy,
    score
  };
}
