/**
 * Check if a string contains Chinese characters
 * @param text - Text to check
 * @returns true if text contains at least one Chinese character
 */
export const containsChinese = (text: string): boolean => {
  // Chinese character ranges in Unicode
  const chineseRegex = /[\u4E00-\u9FFF\u3400-\u4DBF]/;
  return chineseRegex.test(text);
};

/**
 * Extract only Chinese characters from text
 * @param text - Text to filter
 * @returns String containing only Chinese characters
 */
export const extractChinese = (text: string): string => {
  return text
    .replace(/[a-zA-Z0-9\s.,!?;:'"()\-–—\[\]{}\/\\@#$%^&*+=_`~<>|]+/g, '')
    .trim();
};
