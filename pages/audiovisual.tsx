import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import SEOHead from '@/components/SEOHead';

export default function Audiovisual() {


  const handleParticipateClick = () => {
    // Função vazia para manter compatibilidade
  };

  return (
    <>
      <SEOHead 
        title="Audiovisual & Creators - CERRADØ INTERBOX 2025"
        description="Faça parte da equipe audiovisual do CERRADØ INTERBOX 2025. Estamos reunindo criadores para eternizar a intensidade do maior evento de times da América Latina."
        image="/images/og-interbox.png"
        type="website"
        keywords="audiovisual, creators, fotografia, vídeo, drone, podcast, mídia, CERRADØ INTERBOX, cobertura de evento"
        tags={["audiovisual", "creators", "fotografia", "vídeo", "podcast", "mídia", "cobertura"]}
        canonical="https://cerradointerbox.com.br/audiovisual"
      />
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0]">
        <Header />
        
        <main className="pt-24 pb-16 px-4 relative overflow-hidden">
          {/* BG grunge com textura de ruído */}
          <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
            <div className="w-full h-full bg-[url('/images/bg_grunge.png')], bg-repeat opacity-20 mix-blend-multiply"></div>
          </div>
          
          {/* Hero Image Tribalístico */}
          <div className="relative -mx-4 md:-mx-16 mb-16 overflow-hidden">
            {/* Container da imagem com efeitos */}
            <div className="relative h-96 md:h-[500px] w-full">
              {/* Imagem principal */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/ArtIA/IMG_4226.webp')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              {/* Overlay tribalístico com gradiente */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent"></div>
              
              {/* Elementos tribais decorativos */}
              <div className="absolute top-0 left-0 w-full h-full">
                {/* Linhas tribais superiores */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-pink-500/80"></div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-cyan-500/80"></div>
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-pink-500/60"></div>
                
                {/* Elementos tribais laterais */}
                <div className="absolute top-1/4 left-8 w-2 h-16 bg-gradient-to-b from-pink-500 to-transparent"></div>
                <div className="absolute top-1/4 right-8 w-2 h-16 bg-gradient-to-b from-cyan-500 to-transparent"></div>
                
                {/* Círculos tribais */}
                <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-pink-500/80 rounded-full"></div>
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyan-500/80 rounded-full"></div>
                <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-pink-500/60 rounded-full"></div>
                <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-cyan-500/60 rounded-full"></div>
              </div>
              
              {/* Texto sobreposto */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white z-10">
                  <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-wider glitch-text" data-text="CERRADØ">
                  Audiovisual
                  </h1>
                  <h2 className="text-2xl md:text-4xl font-bold mb-9 tracking-wide" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                  & Creators
                  </h2>
                  <p className="text-lg md:text-xl font-medium opacity-90" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                    <span className="bg-black/60 text-gray-500 backdrop-blur-sm border border-pink-500/30 rounded-lg px-4 py-2 inline-block">
                      cadastro no final da página
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Efeito de brilho tribal */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent animate-pulse"></div>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            {/* Copy nova em cards/quadro grunge */}
            <div className="space-y-10">
              <div className="bg-black/80 border border-pink-500 rounded-2xl shadow-[0_8px_32px_0_rgba(236,72,153,0.25)] p-8 text-left relative grunge-card">
                <div className="absolute -top-4 -left-4 w-16 h-8 bg-pink-600/20 rounded-full blur-lg rotate-[-8deg]" />
                <h2 className="text-2xl font-bold text-pink-400 mb-2 flex items-center gap-2 glitch-text">🧩 O que é</h2>
                <p className="text-gray-200">
                  Estamos reunindo uma equipe criativa para viver o CERRADØ 𝗜𝗡𝗧𝗘𝗥𝗕𝗢𝗫 por dentro.<br/>
                  Mais do que uma cobertura, essa missão é sobre eternizar a intensidade do momento, a estética da superação e a emoção de quem veio para fazer história.
                </p>
              </div>
              <div className="bg-black/80 border border-cyan-500 rounded-2xl shadow-[0_8px_32px_0_rgba(34,211,238,0.18)] p-8 text-left relative grunge-card">
                <div className="absolute -bottom-4 -right-4 w-16 h-8 bg-cyan-600/20 rounded-full blur-lg rotate-[8deg]" />
                <h2 className="text-2xl font-bold text-cyan-400 mb-2 flex items-center gap-2 glitch-text">🧠 O que esperamos de você</h2>
                <ul className="text-gray-200 space-y-1 list-disc pl-6">
                  <li>Olhar sensível e mente afiada para storytelling</li>
                  <li>Agilidade e experiência com eventos e esporte</li>
                  <li>Disponibilidade para atuar nos dias do evento</li>
                  <li>Noção de conteúdo para redes sociais e marcas</li>
                  <li><strong>Para criadores/podcasts:</strong> Canal ativo e comunidade engajada</li>
                  <li><strong>Para mídia:</strong> Veículo estabelecido e alcance comprovado</li>
                  <li><strong>Para todos:</strong> Estética alinhada ao universo Interbox</li>
                </ul>
              </div>
              <div className="bg-black/80 border border-pink-500 rounded-2xl shadow-[0_8px_32px_0_rgba(236,72,153,0.25)] p-8 text-left relative grunge-card">
                <div className="absolute -top-4 -right-4 w-16 h-8 bg-pink-600/20 rounded-full blur-lg rotate-[8deg]" />
                <h2 className="text-2xl font-bold text-pink-400 mb-2 flex items-center gap-2 glitch-text">💬 O que os atletas esperam de você</h2>
                <p className="text-gray-200">
                  Eles vêm em busca da sua melhor versão — e confiam em você para registrá-la.<br/>
                  Você será procurado, recomendado, valorizado. O audiovisual não é apoio, é parte do espetáculo.<br/>
                  A cobertura visual é um serviço essencial e reconhecido durante todo o evento.
                </p>
              </div>
              <div className="bg-black/80 border border-cyan-500 rounded-2xl shadow-[0_8px_32px_0_rgba(34,211,238,0.18)] p-8 text-left relative grunge-card">
                <div className="absolute -bottom-4 -left-4 w-16 h-8 bg-cyan-600/20 rounded-full blur-lg rotate-[-8deg]" />
                <h2 className="text-2xl font-bold text-cyan-400 mb-2 flex items-center gap-2 glitch-text">🎁 O que você recebe</h2>
                <ul className="text-gray-200 space-y-1 list-disc pl-6">
                  <li>Acesso VIP completo ao evento</li>
                  <li>Kit oficial exclusivo Interbox</li>
                  <li>Créditos em vídeos e postagens oficiais</li>
                  <li>Portfólio com visibilidade real e nacional</li>
                  <li>Networking com atletas, marcas e agências</li>
                  <li>Destaque nos canais oficiais</li>
                  <li>Possibilidade de bônus por entrega de alto impacto</li>
                </ul>
              </div>
              <div className="bg-black/80 border border-pink-500 rounded-2xl shadow-[0_8px_32px_0_rgba(236,72,153,0.25)] p-8 text-left relative grunge-card">
                <div className="absolute -top-4 -left-4 w-16 h-8 bg-pink-600/20 rounded-full blur-lg rotate-[-8deg]" />
                <h2 className="text-2xl font-bold text-pink-400 mb-2 flex items-center gap-2 glitch-text">📽️ Como funciona</h2>
                <p className="text-gray-200 mb-2">
                  <strong>Áreas técnicas:</strong> Foto, Vídeo, Drone, Pós, Direção Criativa e Social Media<br/>
                  <strong>Áreas de conteúdo:</strong> Podcasts, Criadores de Conteúdo, Veículos de Mídia e Influenciadores<br/>
                  Você terá acesso antecipado a briefings, áreas restritas e cronogramas de ação.
                </p>
              </div>
              <div className="bg-black/80 border border-cyan-500 rounded-2xl shadow-[0_8px_32px_0_rgba(34,211,238,0.18)] p-8 text-left relative grunge-card">
                <div className="absolute -bottom-4 -right-4 w-16 h-8 bg-cyan-600/20 rounded-full blur-lg rotate-[8deg]" />
                <h2 className="text-2xl font-bold text-cyan-400 mb-2 flex items-center gap-2 glitch-text">📝 As vagas são limitadas.</h2>
                <p className="text-gray-200">
                  Envie seu portfólio e venha fazer parte da história.
                </p>
              </div>
            </div>

            {/* Análise IA do Perfil - Componente temporariamente removido */}
            <div className="mt-16">
              {/* <AudiovisualAnalysis /> */}
            </div>

            {/* Botão Google Forms minimalista */}
            <div className="text-center mt-12 relative z-10">
              <a
                href="/audiovisual/form"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleParticipateClick}
                className="inline-block relative cursor-pointer transition-transform duration-200 hover:scale-105"
              >
                <div className="relative">
                  {/* Sombra natural (retangular) */}
                  <div className="absolute inset-0 bg-pink-600/20 rounded-xl blur-lg transform rotate-1 scale-105"></div>
                  <div className="absolute inset-0 bg-pink-600/10 rounded-xl blur-md transform -rotate-1 scale-105"></div>
                  {/* Fita original */}
                  <div className="relative strobo-button papel-vintage">
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl tracking-wide z-10">
                      Quero participar
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Extensão com fundo escuro */}
          <div className="bg-black text-white py-16 -mt-8 -mx-4 md:-mx-16 relative z-0">
            <div className="max-w-4xl mx-auto px-4 md:px-16 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                Faça parte da história
              </h3>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                O CERRADØ 𝗜𝗡𝗧𝗘𝗥𝗕𝗢𝗫 não é apenas um evento. É um movimento que vai redefinir o fitness competitivo na América Latina. E você pode estar no centro dessa revolução.
              </p>
            </div>
          </div>

          {/* CSS extra para glitch e grunge */}
          <style jsx>{`
            .glitch-text {
              position: relative;
              color: #3b82f6;
              letter-spacing: 0.04em;
            }
            .glitch-text:after {
              content: attr(data-text);
              position: absolute;
              left: 2px;
              top: 2px;
              color: #ec4899;
              opacity: 0.4;
              z-index: -1;
              filter: blur(1px);
            }
            .grunge-card {
              border-radius: 1.25rem 2.5rem 1.5rem 2.25rem/2rem 1.25rem 2.5rem 1.5rem;
              border-width: 2.5px;
            }
            .grunge-btn {
              box-shadow: 0 2px 24px 0 #ec4899aa, 0 1.5px 0 0 #111;
              border-radius: 1.5rem 2.5rem 1.5rem 2.25rem/2rem 1.25rem 2.5rem 1.5rem;
            }
            .logo-grunge {
              transition: transform 0.3s;
            }
            @media (min-width: 768px) {
              .logo-grunge {
                transform: translateX(26%);
              }
            }
            
            /* Animação de strobo a cada 15 segundos */
            .strobo-button {
              animation: strobo 15s infinite;
            }
            
            @keyframes strobo {
              0%, 95% {
                box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
                transform: scale(1);
              }
              96% {
                box-shadow: 0 0 50px rgba(236, 72, 153, 1);
                transform: scale(1.05);
              }
              97% {
                box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
                transform: scale(1);
              }
              98% {
                box-shadow: 0 0 80px rgba(236, 72, 153, 1);
                transform: scale(1.08);
              }
              99% {
                box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
                transform: scale(1);
              }
              100% {
                box-shadow: 0 0 100px rgba(236, 72, 153, 1);
                transform: scale(1.1);
              }
            }
            .papel-vintage {
              background-image: url('/images/pngtree-light-gray-old-paper.png');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              width: 400px;
              height: 120px;
              filter: hue-rotate(320deg) saturate(1.5) brightness(1.1);
            }
          `}</style>
        </main>
        <Footer />
      </div>
    </>
  );
} 