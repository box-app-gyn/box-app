import { NextRequest, NextResponse } from 'next/server';

// Configurações de segurança
const SECURITY_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 100,
  BLOCKED_IPS: new Set<string>(),
  ALLOWED_ORIGINS: [
    'https://interbox.com.br',
    'https://www.interbox.com.br',
    'https://flowpay.com.br',
    'https://www.flowpay.com.br',
    'http://localhost:3000'
  ],
  BLOCKED_USER_AGENTS: [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python-requests'
  ]
};

// Rate limiting em memória (em produção, usar Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Função para verificar rate limit
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minuto
    return true;
  }
  
  if (clientData.count >= SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  clientData.count++;
  return true;
}

// Função para verificar User-Agent suspeito
function isSuspiciousUserAgent(userAgent: string): boolean {
  const lowerUA = userAgent.toLowerCase();
  return SECURITY_CONFIG.BLOCKED_USER_AGENTS.some(blocked => 
    lowerUA.includes(blocked)
  );
}

// Função para verificar origem da requisição
function isAllowedOrigin(origin: string): boolean {
  return SECURITY_CONFIG.ALLOWED_ORIGINS.includes(origin);
}

// Função para sanitizar headers
function sanitizeHeaders(headers: Headers): Headers {
  const sanitized = new Headers();
  
  // Copiar apenas headers seguros
  const safeHeaders = [
    'accept',
    'accept-language',
    'content-type',
    'user-agent',
    'referer',
    'origin',
    'x-requested-with'
  ];
  
  for (const [key, value] of headers.entries()) {
    if (safeHeaders.includes(key.toLowerCase())) {
      sanitized.set(key, value);
    }
  }
  
  return sanitized;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  // Log da requisição
  console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} - IP: ${ip} - UA: ${userAgent.slice(0, 100)}`);

  // Adicionar headers de segurança básicos
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 