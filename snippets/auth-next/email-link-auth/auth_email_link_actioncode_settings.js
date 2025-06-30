// Firebase Email Link Authentication - Action Code Settings
// Configuração para autenticação via link de email

import { getAuth, ActionCodeSettings } from 'firebase/auth';

// Configuração das ações de código para email link auth
export const actionCodeSettings: ActionCodeSettings = {
  // URL que será aberta quando o usuário clicar no link
  url: 'https://interbox-app-8d400.web.app/login',
  
  // Configurações de manipulação do link
  handleCodeInApp: true,
  
  // Configurações de iOS (opcional)
  iOS: {
    bundleId: 'com.interbox.app'
  },
  
  // Configurações de Android (opcional)
  android: {
    packageName: 'com.interbox.app',
    installApp: true,
    minimumVersion: '12'
  },
  
  // Configurações dinâmicas de link
  dynamicLinkDomain: 'interbox-app-8d400.page.link'
};

// Função para enviar email de verificação
export const sendEmailVerification = async (email: string) => {
  const auth = getAuth();
  
  try {
    await auth.sendSignInLinkToEmail(email, actionCodeSettings);
    
    // Salvar email no localStorage para uso posterior
    window.localStorage.setItem('emailForSignIn', email);
    
    return {
      success: true,
      message: 'Email de verificação enviado! Verifique sua caixa de entrada.'
    };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Função para verificar link de email
export const verifyEmailLink = async () => {
  const auth = getAuth();
  
  try {
    // Verificar se o link é válido
    const result = await auth.isSignInWithEmailLink(window.location.href);
    
    if (result) {
      // Recuperar email do localStorage
      let email = window.localStorage.getItem('emailForSignIn');
      
      // Se não tiver email salvo, pedir ao usuário
      if (!email) {
        email = window.prompt('Por favor, informe seu email para confirmar:');
      }
      
      // Fazer sign in com o link
      const userCredential = await auth.signInWithEmailLink(email, window.location.href);
      
      // Limpar localStorage
      window.localStorage.removeItem('emailForSignIn');
      
      return {
        success: true,
        user: userCredential.user,
        message: 'Email verificado com sucesso!'
      };
    } else {
      return {
        success: false,
        message: 'Link inválido ou expirado.'
      };
    }
  } catch (error) {
    console.error('Erro ao verificar link:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Função para reenviar email de verificação
export const resendVerificationEmail = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return {
      success: false,
      message: 'Usuário não autenticado.'
    };
  }
  
  try {
    await user.sendEmailVerification(actionCodeSettings);
    
    return {
      success: true,
      message: 'Email de verificação reenviado!'
    };
  } catch (error) {
    console.error('Erro ao reenviar email:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Hook para verificar se o usuário chegou via link de email
export const useEmailLinkAuth = () => {
  const auth = getAuth();
  
  const checkEmailLink = async () => {
    if (auth.isSignInWithEmailLink(window.location.href)) {
      return await verifyEmailLink();
    }
    return null;
  };
  
  return { checkEmailLink };
};

// Configuração para Next.js
export const emailLinkAuthConfig = {
  // Página de sucesso após verificação
  successUrl: '/dashboard',
  
  // Página de erro
  errorUrl: '/login?error=email-verification-failed',
  
  // Tempo de expiração do link (em segundos)
  linkExpirationTime: 3600, // 1 hora
  
  // Configurações de email
  emailSettings: {
    subject: 'Verifique seu email - Interbox 2025',
    template: 'verification-email',
    from: 'noreply@interbox-app-8d400.firebaseapp.com'
  }
}; 