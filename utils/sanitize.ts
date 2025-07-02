export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .trim()
    .substring(0, 100); // Limita tamanho
}; 