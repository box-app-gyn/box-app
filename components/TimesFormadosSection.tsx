import React from 'react';
import GamifiedCTA from './GamifiedCTA';

const TimesFormadosSection: React.FC = () => {
  return (
    <section id="times" className="py-20 bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Título */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
             Atletas
          </h2>
          <p className="text-base sm:text-lg text-gray-400">
            O CERRADØ 𝗜𝗡𝗧𝗘𝗥𝗕𝗢𝗫 vai além da arena. Aqui começa o ritual.
          </p>
        </div>

        <div className="space-y-12">

          {/* Introdução */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Pronto para competir com propósito?</h3>
            <p className="text-gray-400">
              As inscrições ainda não abriram, mas você já pode se preparar para viver a jornada mais intensa do ano.
              O evento une competição, comunidade, tecnologia e identidade real.
            </p>
          </div>

          {/* Aviso — inscrições */}
          <div className="border-l-4 border-yellow-400 pl-4 py-4 bg-yellow-500/5 rounded-md">
            <h4 className="text-lg font-medium text-yellow-300 mb-2">⚠️ Inscrições ainda não abertas</h4>
            <p className="text-gray-300 mb-2">
              Os detalhes finais estão sendo validados com atletas convidados e boxes parceiros:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>Categorias por nível de experiência</li>
              <li>Formação ideal de times</li>
              <li>Gamificação da jornada de participação</li>
            </ul>
          </div>

          {/* O que esperar */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">📌 O que você pode esperar:</h4>

            {/* Mobile - lista */}
            <ul className="list-disc list-inside text-gray-400 space-y-1 sm:hidden">
              <li>Arena real com transmissão ao vivo</li>
              <li>Ranking atualizado em tempo real</li>
              <li>Desafios híbridos antes e durante o evento</li>
              <li>Reconhecimento por engajamento de time</li>
              <li>Kit do atleta com brindes físicos e digitais</li>
            </ul>

            {/* Desktop - tabela */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full border border-gray-700 text-left text-sm text-gray-300">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-4 py-3 border-b border-gray-700">Benefício</th>
                    <th className="px-4 py-3 border-b border-gray-700">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3 border-b border-gray-800">Arena com transmissão</td>
                    <td className="px-4 py-3 border-b border-gray-800">Competições presenciais com streaming ao vivo</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border-b border-gray-800">Ranking em tempo real</td>
                    <td className="px-4 py-3 border-b border-gray-800">Pontuação atualizada no WebApp oficial</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border-b border-gray-800">Desafios híbridos</td>
                    <td className="px-4 py-3 border-b border-gray-800">Ativações digitais e físicas durante toda a temporada</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border-b border-gray-800">Reconhecimento por engajamento</td>
                    <td className="px-4 py-3 border-b border-gray-800">Times mais ativos ganham destaque e premiações</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Kit do Atleta</td>
                    <td className="px-4 py-3">Itens físicos e digitais colecionáveis e exclusivos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Comunidade CTA */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700/40 text-center">
            <h4 className="text-xl font-bold mb-3">💬 Receba tudo em primeira mão</h4>
            <p className="text-gray-400 mb-4">
              Entre agora na comunidade oficial no WhatsApp e acompanhe os bastidores.
            </p>
            <GamifiedCTA 
              href="https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz"
              tooltipText="Entrar na Comunidade"
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
  );
};

export default TimesFormadosSection; 