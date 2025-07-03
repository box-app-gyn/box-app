export const handleAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    const errorCode = (error as any).code;
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado';
      case 'auth/wrong-password':
        return 'Senha incorreta';
      case 'auth/email-already-in-use':
        return 'Email já está em uso';
      case 'auth/weak-password':
        return 'Senha muito fraca';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente em alguns minutos';
      default:
        return 'Erro de autenticação. Tente novamente';
    }
  }
  return 'Erro inesperado. Tente novamente';
}; 