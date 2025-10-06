/**
 * Utility function to map Portuguese adjustment texts to translation keys
 * This helps internationalize the "Top 10 Most Frequent Adjustments" chart
 */

export interface AdjustmentMapping {
  [key: string]: string;
}

// Map Portuguese adjustment texts to translation keys
export const adjustmentToTranslationKey: AdjustmentMapping = {
  // General alignment
  "Bom alinhamento geral": "adjustments.goodGeneralAlignment",
  "Alinhamento geral adequado": "adjustments.goodGeneralAlignment",
  "Alinhamento perfeito": "adjustments.goodGeneralAlignment",
  
  // Tone of voice adjustments
  "Pequeno ajuste no tom de voz": "adjustments.minorToneAdjustment",
  "Tom de voz alinhado perfeitamente com a marca": "adjustments.perfectToneAlignment",
  "Tom de voz refinado": "adjustments.refinedTone",
  "Ajuste no tom": "adjustments.toneAdjustment",
  "Tom adequado": "adjustments.adequateTone",
  
  // Hashtags
  "Hashtags apropriadas": "adjustments.appropriateHashtags",
  "Hashtags adequadas": "adjustments.appropriateHashtags",
  "Boas hashtags": "adjustments.goodHashtags",
  
  // Vocabulary
  "Vocabulário premium utilizado corretamente": "adjustments.premiumVocabulary",
  "Ajustes moderados no vocabulário": "adjustments.moderateVocabularyAdjustments",
  "Vocabulário adequado": "adjustments.adequateVocabulary",
  "Melhoria no vocabulário": "adjustments.vocabularyImprovement",
  
  // Visual style
  "Estilo visual impecável": "adjustments.impeccableVisualStyle",
  "Estilo visual adequado": "adjustments.adequateVisualStyle",
  "Boa apresentação visual": "adjustments.goodVisualPresentation",
  
  // Content additions (already in English, but we'll map them for consistency)
  "Added emojis to the Instagram caption": "adjustments.addedEmojis",
  "Added a mention of sustainability": "adjustments.addedSustainability",
  "Added call-to-action": "adjustments.addedCTA",
  "Added brand mention": "adjustments.addedBrandMention",
  
  // Structure improvements
  "Estrutura melhorada": "adjustments.improvedStructure",
  "Organização do conteúdo": "adjustments.contentOrganization",
  "Formatação adequada": "adjustments.adequateFormatting",
  
  // Compliance improvements
  "Conformidade com brand book": "adjustments.brandBookCompliance",
  "Alinhamento com diretrizes": "adjustments.guidelineAlignment",
  "Adequação às regras": "adjustments.ruleCompliance",
};

/**
 * Get translation key for an adjustment text
 * @param adjustmentText - The original adjustment text (usually in Portuguese)
 * @returns Translation key or the original text if no mapping found
 */
export function getAdjustmentTranslationKey(adjustmentText: string): string {
  // First try exact match
  const exactMatch = adjustmentToTranslationKey[adjustmentText];
  if (exactMatch) {
    return exactMatch;
  }
  
  // Try partial matches for common patterns
  const lowerText = adjustmentText.toLowerCase();
  
  // Tone of voice patterns
  if (lowerText.includes('tom de voz') || lowerText.includes('tom')) {
    if (lowerText.includes('refinado')) return "adjustments.refinedTone";
    if (lowerText.includes('alinhado') || lowerText.includes('perfeito')) return "adjustments.perfectToneAlignment";
    return "adjustments.toneAdjustment";
  }
  
  // Vocabulary patterns
  if (lowerText.includes('vocabulário')) {
    if (lowerText.includes('premium')) return "adjustments.premiumVocabulary";
    if (lowerText.includes('moderado')) return "adjustments.moderateVocabularyAdjustments";
    return "adjustments.vocabularyImprovement";
  }
  
  // Hashtag patterns
  if (lowerText.includes('hashtag')) {
    return "adjustments.appropriateHashtags";
  }
  
  // Visual style patterns
  if (lowerText.includes('estilo visual') || lowerText.includes('visual')) {
    if (lowerText.includes('impecável')) return "adjustments.impeccableVisualStyle";
    return "adjustments.adequateVisualStyle";
  }
  
  // Alignment patterns
  if (lowerText.includes('alinhamento')) {
    return "adjustments.goodGeneralAlignment";
  }
  
  // English patterns (for mixed content)
  if (lowerText.includes('added emoji')) return "adjustments.addedEmojis";
  if (lowerText.includes('sustainability')) return "adjustments.addedSustainability";
  if (lowerText.includes('call-to-action') || lowerText.includes('cta')) return "adjustments.addedCTA";
  
  // Return original text if no pattern matches
  return adjustmentText;
}

/**
 * Check if an adjustment text has a translation available
 * @param adjustmentText - The adjustment text to check
 * @returns True if translation is available, false otherwise
 */
export function hasAdjustmentTranslation(adjustmentText: string): boolean {
  const translationKey = getAdjustmentTranslationKey(adjustmentText);
  return translationKey !== adjustmentText && translationKey.startsWith('adjustments.');
}