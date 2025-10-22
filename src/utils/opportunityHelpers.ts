export type OpportunityType = 'event' | 'meeting' | 'appointment' | 'conference' | 'other';

/**
 * Infer opportunity type from title keywords
 */
export function inferOpportunityType(title: string): OpportunityType {
  const titleLower = title.toLowerCase().trim();
  
  if (titleLower.includes('conference') || titleLower.includes('summit')) {
    return 'conference';
  }
  if (titleLower.includes('event') || titleLower.includes('workshop') || titleLower.includes('seminar')) {
    return 'event';
  }
  if (titleLower.includes('meeting') || titleLower.includes('call') || titleLower.includes('discussion')) {
    return 'meeting';
  }
  if (titleLower.includes('appointment') || titleLower.includes('interview')) {
    return 'appointment';
  }
  
  return 'other';
}

/**
 * Get color classes for opportunity type badges
 */
export function getTypeColor(type: OpportunityType): string {
  switch (type) {
    case 'event':
      return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700';
    case 'meeting':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
    case 'appointment':
      return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
    case 'conference':
      return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700';
    case 'other':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700';
  }
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Fuzzy match two titles
 */
export function fuzzyTitleMatch(title1: string, title2: string): boolean {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const t1 = normalize(title1);
  const t2 = normalize(title2);
  
  // Exact match
  if (t1 === t2) return true;
  
  // Check if one contains the other (80% threshold)
  const longer = t1.length > t2.length ? t1 : t2;
  const shorter = t1.length > t2.length ? t2 : t1;
  if (longer.includes(shorter) && shorter.length / longer.length > 0.8) return true;
  
  // Levenshtein distance < 3
  return levenshteinDistance(t1, t2) < 3;
}

/**
 * Calculate match score between two opportunities (0-1)
 */
export function calculateMatchScore(
  opp1: { title: string; date: string; contact_id?: string },
  opp2: { title: string; date: string; contact_id?: string }
): number {
  let score = 0;
  
  // Title similarity (0-50 points)
  const titleSimilarity = fuzzyTitleMatch(opp1.title, opp2.title) ? 50 : 0;
  score += titleSimilarity;
  
  // Date proximity (0-30 points)
  const date1 = new Date(opp1.date);
  const date2 = new Date(opp2.date);
  const hoursDiff = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff < 2) score += 30;
  else if (hoursDiff < 6) score += 20;
  else if (hoursDiff < 24) score += 10;
  
  // Contact match (0-20 points)
  if (opp1.contact_id && opp2.contact_id && opp1.contact_id === opp2.contact_id) {
    score += 20;
  }
  
  return score / 100; // Normalize to 0-1
}
