/**
 * Sistema de mapeamento para converter textos de ajustes da IA em chaves de tradução padronizadas
 */

export interface AdjustmentMapping {
  patterns: RegExp[];
  translationKey: string;
  category: 'vocabulary' | 'tone' | 'style' | 'structure' | 'emoji' | 'length' | 'content' | 'general';
}

export const adjustmentMappings: AdjustmentMapping[] = [
  // Vocabulary replacements
  {
    patterns: [
      /replaced?\s+['"]([^'"]+)['"]?\s+with\s+['"]([^'"]+)['"]?/i,
      /substituíd[oa]?\s+['"]([^'"]+)['"]?\s+por\s+['"]([^'"]+)['"]?/i,
      /changed?\s+['"]([^'"]+)['"]?\s+to\s+['"]([^'"]+)['"]?/i,
      /alterou\s+['"]([^'"]+)['"]?\s+para\s+['"]([^'"]+)['"]?/i,
    ],
    translationKey: 'adjustments.vocabulary.wordReplacement',
    category: 'vocabulary'
  },
  {
    patterns: [
      /removed?\s+forbidden\s+word/i,
      /removeu\s+palavra\s+proibida/i,
      /eliminated?\s+forbidden\s+term/i,
      /eliminou\s+termo\s+proibido/i,
    ],
    translationKey: 'adjustments.vocabulary.forbiddenWordRemoved',
    category: 'vocabulary'
  },
  {
    patterns: [
      /used?\s+preferred\s+vocabulary/i,
      /usou\s+vocabulário\s+preferido/i,
      /applied?\s+brand\s+vocabulary/i,
      /aplicou\s+vocabulário\s+da\s+marca/i,
    ],
    translationKey: 'adjustments.vocabulary.preferredUsed',
    category: 'vocabulary'
  },

  // Tone adjustments
  {
    patterns: [
      /adjusted?\s+tone\s+to\s+be\s+more\s+(accessible|friendly)/i,
      /ajustou\s+tom\s+para\s+ser\s+mais\s+(acessível|amigável)/i,
      /made?\s+tone\s+more\s+(warm|welcoming)/i,
      /tornou\s+tom\s+mais\s+(caloroso|acolhedor)/i,
    ],
    translationKey: 'adjustments.tone.madeMoreAccessible',
    category: 'tone'
  },
  {
    patterns: [
      /adjusted?\s+tone\s+to\s+match\s+brand/i,
      /ajustou\s+tom\s+para\s+combinar\s+com\s+a\s+marca/i,
      /aligned?\s+tone\s+with\s+brand\s+voice/i,
      /alinhou\s+tom\s+com\s+a\s+voz\s+da\s+marca/i,
    ],
    translationKey: 'adjustments.tone.alignedWithBrand',
    category: 'tone'
  },
  {
    patterns: [
      /focused?\s+on\s+(comfort|versatility|practicality)/i,
      /focou\s+em\s+(conforto|versatilidade|praticidade)/i,
      /emphasized?\s+(comfort|versatility|practicality)/i,
      /enfatizou\s+(conforto|versatilidade|praticidade)/i,
    ],
    translationKey: 'adjustments.tone.focusedOnValues',
    category: 'tone'
  },

  // Style improvements
  {
    patterns: [
      /shortened?\s+sentences?\s+to\s+be\s+under\s+(\d+)\s+words?/i,
      /encurtou\s+frases?\s+para\s+ficar\s+abaixo\s+de\s+(\d+)\s+palavras?/i,
      /reduced?\s+sentence\s+length/i,
      /reduziu\s+o\s+tamanho\s+das\s+frases/i,
    ],
    translationKey: 'adjustments.style.shortenedSentences',
    category: 'length'
  },
  {
    patterns: [
      /improved?\s+readability/i,
      /melhorou\s+a\s+legibilidade/i,
      /enhanced?\s+clarity/i,
      /aprimorou\s+a\s+clareza/i,
    ],
    translationKey: 'adjustments.style.improvedReadability',
    category: 'style'
  },
  {
    patterns: [
      /simplified?\s+language/i,
      /simplificou\s+a\s+linguagem/i,
      /made?\s+language\s+clearer/i,
      /tornou\s+a\s+linguagem\s+mais\s+clara/i,
    ],
    translationKey: 'adjustments.style.simplifiedLanguage',
    category: 'style'
  },

  // Emoji adjustments
  {
    patterns: [
      /added?\s+emojis?\s+to\s+the?\s+(instagram\s+)?caption/i,
      /adicionou\s+emojis?\s+à\s+legenda\s+(do\s+instagram)?/i,
      /included?\s+emojis?\s+for\s+engagement/i,
      /incluiu\s+emojis?\s+para\s+engajamento/i,
    ],
    translationKey: 'adjustments.emoji.addedToCaption',
    category: 'emoji'
  },
  {
    patterns: [
      /removed?\s+excessive\s+emojis?/i,
      /removeu\s+emojis?\s+excessivos?/i,
      /reduced?\s+emoji\s+usage/i,
      /reduziu\s+o\s+uso\s+de\s+emojis?/i,
    ],
    translationKey: 'adjustments.emoji.reducedUsage',
    category: 'emoji'
  },

  // Content structure
  {
    patterns: [
      /added?\s+a?\s+mention\s+of\s+sustainability/i,
      /adicionou\s+uma?\s+menção\s+à\s+sustentabilidade/i,
      /included?\s+sustainability\s+reference/i,
      /incluiu\s+referência\s+à\s+sustentabilidade/i,
    ],
    translationKey: 'adjustments.content.addedSustainability',
    category: 'content'
  },
  {
    patterns: [
      /improved?\s+call[- ]to[- ]action/i,
      /melhorou\s+a?\s+chamada\s+para\s+ação/i,
      /enhanced?\s+cta/i,
      /aprimorou\s+o?\s+cta/i,
    ],
    translationKey: 'adjustments.content.improvedCTA',
    category: 'content'
  },
  {
    patterns: [
      /added?\s+brand\s+values?\s+reference/i,
      /adicionou\s+referência\s+aos?\s+valores?\s+da\s+marca/i,
      /included?\s+brand\s+messaging/i,
      /incluiu\s+mensagem\s+da\s+marca/i,
    ],
    translationKey: 'adjustments.content.addedBrandValues',
    category: 'content'
  },

  // General adjustments
  {
    patterns: [
      /improved?\s+overall\s+compliance/i,
      /melhorou\s+a?\s+conformidade\s+geral/i,
      /enhanced?\s+brand\s+alignment/i,
      /aprimorou\s+o?\s+alinhamento\s+com\s+a\s+marca/i,
    ],
    translationKey: 'adjustments.general.improvedCompliance',
    category: 'general'
  },
  {
    patterns: [
      /optimized?\s+for\s+target\s+audience/i,
      /otimizou\s+para\s+o?\s+público[- ]alvo/i,
      /tailored?\s+to\s+audience/i,
      /adaptou\s+para\s+o?\s+público/i,
    ],
    translationKey: 'adjustments.general.optimizedForAudience',
    category: 'general'
  }
];

/**
 * Mapeia um texto de ajuste da IA para uma chave de tradução padronizada
 */
export function mapAdjustmentToTranslationKey(adjustmentText: string): string {
  const normalizedText = adjustmentText.trim();
  
  // Procura por padrões conhecidos
  for (const mapping of adjustmentMappings) {
    for (const pattern of mapping.patterns) {
      if (pattern.test(normalizedText)) {
        return mapping.translationKey;
      }
    }
  }
  
  // Se não encontrar um padrão específico, tenta categorizar por palavras-chave
  const lowerText = normalizedText.toLowerCase();
  
  if (lowerText.includes('replaced') || lowerText.includes('substituíd') || 
      lowerText.includes('changed') || lowerText.includes('alterou')) {
    return 'adjustments.vocabulary.wordReplacement';
  }
  
  if (lowerText.includes('tone') || lowerText.includes('tom')) {
    return 'adjustments.tone.general';
  }
  
  if (lowerText.includes('emoji')) {
    return 'adjustments.emoji.general';
  }
  
  if (lowerText.includes('sentence') || lowerText.includes('frase') ||
      lowerText.includes('shortened') || lowerText.includes('encurtou')) {
    return 'adjustments.style.shortenedSentences';
  }
  
  if (lowerText.includes('sustainability') || lowerText.includes('sustentabilidade')) {
    return 'adjustments.content.addedSustainability';
  }
  
  // Fallback para ajuste genérico
  return 'adjustments.general.generic';
}

/**
 * Processa uma lista de ajustes da IA e retorna chaves de tradução
 */
export function processAdjustments(adjustments: string[]): string[] {
  return adjustments.map(adjustment => mapAdjustmentToTranslationKey(adjustment));
}

/**
 * Verifica se um texto é uma chave de tradução (começa com 'adjustments.')
 */
export function isTranslationKey(text: string): boolean {
  return text.startsWith('adjustments.');
}

/**
 * Extrai informações específicas de um ajuste (como palavras substituídas)
 */
export function extractAdjustmentDetails(adjustmentText: string): Record<string, string> {
  const details: Record<string, string> = {};
  
  // Extrai palavras substituídas
  const replacementMatch = adjustmentText.match(/replaced?\s+['"]([^'"]+)['"]?\s+with\s+['"]([^'"]+)['"]?/i) ||
                          adjustmentText.match(/substituíd[oa]?\s+['"]([^'"]+)['"]?\s+por\s+['"]([^'"]+)['"]?/i);
  
  if (replacementMatch) {
    details.oldWord = replacementMatch[1];
    details.newWord = replacementMatch[2];
  }
  
  // Extrai números (como limite de palavras)
  const numberMatch = adjustmentText.match(/(\d+)/);
  if (numberMatch) {
    details.number = numberMatch[1];
  }
  
  return details;
}