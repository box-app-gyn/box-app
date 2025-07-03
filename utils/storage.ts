const VALID_USER_TYPES = ['atleta', 'audiovisual', 'publico'] as const;
type UserType = typeof VALID_USER_TYPES[number];

export const getValidatedUserType = (): UserType => {
  try {
    const stored = localStorage.getItem('userType');
    if (stored && VALID_USER_TYPES.includes(stored as UserType)) {
      return stored as UserType;
    }
  } catch (error) {
    console.error('Error reading localStorage:', error);
  }
  return 'atleta';
}; 