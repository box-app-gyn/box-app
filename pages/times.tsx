import React, { useEffect } from 'react';
import Image from 'next/image';
import GamifiedCTA from '../components/GamifiedCTA';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAnalytics } from '@/hooks/useAnalytics';
import SEOHead from '@/components/SEOHead';

const TimesPage: React.FC = () => {
  const { trackPage, trackCTA, trackScroll } = useAnalytics();

  // Tracking de visualização da página de times
  useEffect(() => {
    trackPage('times');
  }, [trackPage]);

  // Tracking de scroll na página de times
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollY / pageHeight) * 100);
      
      // Rastrear scroll a cada 25% da página
      if (scrollPercentage > 0 && scrollPercentage % 25 === 0) {
        trackScroll('times_page', scrollPercentage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScroll]);

  const handleCommunityClick = () => {
    trackCTA('ENTRAR NA COMUNIDADE', '/times');
  };

  return (
    <>
      <SEOHead 
        title="Para Atletas - CERRADØ INTERBOX 2025"
        description="Pronto para competir com propósito? O CERRADØ INTERBOX vai além da arena. Aqui começa o ritual. Forme seu time e entre pra arena."
        image="/images/og-interbox.png"
        type="website"
        keywords="atletas, times, competição, crossfit, inscrições, CERRADØ INTERBOX, formação de times"
        tags={["atletas", "times", "competição", "crossfit", "inscrições"]}
        canonical="https://cerradointerbox.com.br/times"
      />
      <Header />
      
      <main className="min-h-screen bg-gray-950 text-white">
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Bloco de instruções estilo terminal MS-DOS */}
            <div className="bg-black rounded-xl p-6 mb-12 border border-green-600/40 shadow-lg font-mono relative overflow-hidden">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2 flex items-center text-green-400">
                Forme seu time e entre pra arena
                <span className="ml-2 animate-pulse text-green-500 font-mono text-3xl">|</span>
              </h2>
              <p className="text-lg text-green-200 mb-6">
                Cada equipe representa mais do que força. Representa união, estratégia e espírito de tribo.
              </p>

              {/* Como formar times */}
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-bold text-green-400 mb-2">🔧 Como formar times</h3>
                <ul className="list-disc list-inside text-green-100 space-y-1 ml-4">
                  <li>4 atletas por time (2 homens + 2 mulher)</li>
                  <li>Pelo menos 3 integrantes do time devem ser da mesma box (academia), podendo ou não ter um integrante de outro espaço de treinamento.</li>
                  <li>Criação e confirmação via WebApp oficial</li>
                </ul>
              </div>

              {/* Regras de participação */}
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-bold text-green-400 mb-2">📏 Regras de participação</h3>
                <ul className="list-disc list-inside text-green-100 space-y-1 ml-4">
                  <li>Idade mínima: 18 anos (menores podem participar com autorização dos pais/responsáveis)</li>
                  <li>Categorias: Iniciante, Scale, Amador, Master 145+, Rx</li>
                  <li>Alterações no time: até o momento do check-in</li>
                  <li className="text-xs text-green-300">
                    Obs: Alterações feitas a menos de um mês do evento podem não garantir kit personalizado (ex: tamanho de camisa).
                  </li>
                  <li>Todos os membros devem concluir o pagamento para confirmação</li>
                </ul>
              </div>

              {/* Processo de inscrição */}
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-bold text-green-400 mb-2">📝 Processo de inscrição</h3>
                <ol className="list-decimal list-inside text-green-100 space-y-1 ml-4">
                  <li>Um dos membros se cadastra como capitão</li>
                  <li>Cria o nome do time e convida os colegas</li>
                  <li>Cada atleta realiza o pagamento individual</li>
                  <li>O time entra no ranking oficial e começa a jornada digital</li>
                </ol>
              </div>

              {/* Competição */}
              <div>
                <h3 className="text-lg md:text-xl font-bold text-green-400 mb-2">🏆 Competição</h3>
                <ul className="list-disc list-inside text-green-100 space-y-1 ml-4">
                  <li>Formato: presencial + ativações digitais</li>
                  <li>Pontuação: técnica + engajamento no ecossistema</li>
                  <li>Ranking ao vivo: no WebApp e nas telas do evento</li>
                  <li>Premiação: troféus, brindes, acesso VIP 2026 (dinheiro apenas para categoria RX)</li>
                </ul>
              </div>
            </div>

            {/* Título */}
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
                🏋️‍♀️ Para Atletas
              </h1>
              <p className="text-base sm:text-lg text-gray-400">
                O CERRADØ 𝗜𝗡𝗧𝗘𝗥𝗕𝗢𝗫 vai além da arena. Aqui começa o ritual.
              </p>
            </div>

            <div className="space-y-12">

              {/* Introdução */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Pronto para competir com propósito?</h2>
                <p className="text-gray-400">
                  As inscrições ainda não abriram, mas você já pode se preparar para viver a jornada mais intensa do ano.
                  O evento une competição, comunidade, tecnologia e identidade real.
                </p>
              </div>

              {/* Aviso — inscrições */}
              <div className="border-l-4 border-yellow-400 pl-4 py-4 bg-yellow-500/5 rounded-md relative overflow-hidden">
                <Image src="/images/corner.png" alt="" className="absolute top-0 left-0 w-32 h-auto z-10 select-none pointer-events-none" draggable="false" width={128} height={128} style={{ height: 'auto' }} />
                <h3 className="text-lg font-medium text-yellow-300 mb-2">⚠️ Inscrições ainda não abertas</h3>
                <p className="text-gray-300 mb-2">
                  Os detalhes finais estão sendo validados com atletas convidados e boxes parceiros:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  <li>Categorias por nível de experiência</li>
                  <li>Formação ideal de times</li>
                  <li>Gamificação da jornada de participação</li>
                </ul>
              </div>

              {/* Comunidade CTA */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700/40 text-center">
                <h3 className="text-xl font-bold mb-3">💬 Receba tudo em primeira mão</h3>
                <p className="text-gray-400 mb-4">
                  Entre agora na comunidade oficial no WhatsApp e acompanhe os bastidores.
                </p>
                <GamifiedCTA 
                  href="https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz"
                  tooltipText="Entrar na Comunidade"
                  onClick={handleCommunityClick}
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  📲 Entrar na Comunidade INTERBOX
                </GamifiedCTA>
              </div>

              {/* Fechamento */}
              <div className="text-center mt-10">
                <p className="text-gray-400">Treine com sua equipe. Conecte-se com a tribo.</p>
                <p className="text-2xl font-bold text-pink-400 mt-2">Sua convocação está próxima.</p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default TimesPage; 