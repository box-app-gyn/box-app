import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';


interface GamifiedCTAProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  tooltipText?: string;
  onClick?: () => void;
}

// Função para validar e sanitizar URLs
function validateAndSanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '#';
  
  const trimmedUrl = url.trim();
  
  // Permitir apenas URLs internas ou HTTPS
  if (trimmedUrl.startsWith('http://')) {
    return '#';
  }
  
  // Validar URLs internas
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#')) {
    return trimmedUrl;
  }
  
  // Validar URLs HTTPS
  if (trimmedUrl.startsWith('https://')) {
    try {
      const urlObj = new URL(trimmedUrl);
      // Permitir apenas domínios confiáveis
      const allowedDomains = [
        'cerradointerbox.com.br',
        'flowpay.com.br',
        'firebaseapp.com',
        'googleapis.com',
        'chat.whatsapp.com'
      ];
      
      if (allowedDomains.some(domain => urlObj.hostname.endsWith(domain))) {
        return trimmedUrl;
      }
    } catch {
      return '#';
    }
  }
  
  return '#';
}

// Função para sanitizar texto
function sanitizeText(text: string, maxLength: number = 100): string {
  if (typeof text !== 'string') return '';
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}

export default function GamifiedCTA({ 
  children, 
  href, 
  className = "", 
  tooltipText = "VOCÊ FOI ESCOLHIDO",
  onClick 
}: GamifiedCTAProps) {

  const [showTooltip, setShowTooltip] = useState(false);

  // Validar e sanitizar props
  const sanitizedHref = validateAndSanitizeUrl(href);
  const sanitizedTooltipText = sanitizeText(tooltipText, 50);
  const sanitizedClassName = sanitizeText(className, 200);

  // Verificar se a URL é válida
  const isValid = sanitizedHref !== '#';

  const handleClick = useCallback(() => {
    // Executar onClick customizado se fornecido
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  const handleHoverStart = useCallback(() => {
    if (sanitizedTooltipText) {
      setShowTooltip(true);
    }
  }, [sanitizedTooltipText]);

  const handleHoverEnd = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return (
    <motion.div
      className="relative inline-block"
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      whileHover={{ scale: isValid ? 1.05 : 1 }}
      transition={{ duration: 0.33, ease: "easeOut" }}
    >
      <a 
        href={sanitizedHref}
        onClick={handleClick}
        className={`relative overflow-hidden ${sanitizedClassName} ${
          !isValid ? 'cursor-not-allowed opacity-50' : ''
        }`}
        aria-label={sanitizedTooltipText}
        rel={sanitizedHref.startsWith('https://') ? 'noopener noreferrer' : undefined}
        target={sanitizedHref.startsWith('https://') ? '_blank' : undefined}
      >
        {children}
        
        {/* Tooltip energético */}
        {sanitizedTooltipText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={showTooltip ? { 
              opacity: 1, 
              y: -5, 
              scale: 1 
            } : { 
              opacity: 0, 
              y: 10, 
              scale: 0.8 
            }}
            transition={{ 
              duration: 0.33, 
              ease: "easeOut",
              delay: 0.1 
            }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 
                       bg-pink-600 text-white px-3 py-1 rounded-lg text-sm font-bold
                       shadow-[0_0_15px_#E50914] z-10 whitespace-nowrap
                       after:content-[''] after:absolute after:top-full after:left-1/2 
                       after:transform after:-translate-x-1/2 after:border-4 
                       after:border-transparent after:border-t-pink-600"
            role="tooltip"
            aria-hidden={!showTooltip}
          >
            {sanitizedTooltipText}
          </motion.div>
        )}
      </a>
    </motion.div>
  );
} 