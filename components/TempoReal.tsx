import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface TempoRealData {
  ingressos: {
    status: 'em_breve' | 'disponivel' | 'esgotado';
    dataAbertura?: string;
    loteAtual?: number;
    vagasRestantes?: number;
  };
  indicacoes: {
    total: number;
    hoje: number;
  };
  fotografos: {
    total: number;
    aprovados: number;
  };
  xp: {
    total: number;
    media: number;
  };
}

const TempoReal: React.FC = () => {
  const [data, setData] = useState<TempoRealData>({
    ingressos: { status: 'em_breve' },
    indicacoes: { total: 0, hoje: 0 },
    fotografos: { total: 0, aprovados: 0 },
    xp: { total: 0, media: 0 }
  });

  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Data de abertura do Lote 1 (13/07/2025)
  const DATA_ABERTURA_LOTE1 = useMemo(() => new Date('2025-07-13T00:00:00-03:00'), []);

  useEffect(() => {
    // Escutar dados em tempo real do Firestore
    const unsubscribe = onSnapshot(
      doc(db, 'config', 'tempo_real'),
      (doc) => {
        if (doc.exists()) {
          setData(doc.data() as TempoRealData);
        }
      },
      (error) => {
        console.error('Erro ao carregar dados em tempo real:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Contagem regressiva para abertura dos ingressos
    const timer = setInterval(() => {
      const now = new Date();
      const diff = DATA_ABERTURA_LOTE1.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        // Ingressos já estão disponíveis
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [DATA_ABERTURA_LOTE1]);

  const isIngressosDisponiveis = () => {
    return new Date() >= DATA_ABERTURA_LOTE1;
  };

  const getIngressosStatus = () => {
    if (isIngressosDisponiveis()) {
      return data.ingressos.status === 'esgotado' ? 'esgotado' : 'disponivel';
    }
    return 'em_breve';
  };

  const getIngressosText = () => {
    const status = getIngressosStatus();
    
    switch (status) {
      case 'em_breve':
        return {
          title: '🎟️ Ingressos Lote 1',
          subtitle: `Disponível em ${countdown.days} dias`,
          description: '⏳ Em breve – Lote 1 abre em X dias'
        };
      case 'disponivel':
        return {
          title: '🎟️ Ingressos Disponíveis',
          subtitle: `Lote ${data.ingressos.loteAtual || 1}`,
          description: `✅ ${data.ingressos.vagasRestantes || 0} vagas restantes`
        };
      case 'esgotado':
        return {
          title: '🎟️ Ingressos Esgotados',
          subtitle: 'Lote 1',
          description: '❌ Vagas esgotadas'
        };
      default:
        return {
          title: '🎟️ Ingressos',
          subtitle: 'Em breve',
          description: '⏳ Aguarde...'
        };
    }
  };

  const ingressosInfo = getIngressosText();

  return (
    <section className="py-16 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ⚡ O Cerrado já está em movimento
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Veja quem já começou a jornada rumo ao Interbox 2025.
            {!isIngressosDisponiveis() && ' Fique pronto — a pré-venda abre em poucos dias.'}
          </p>
        </motion.div>

        {/* Cards em tempo real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card de Ingressos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className={`rounded-xl p-6 border transition-all duration-300 ${
              getIngressosStatus() === 'em_breve' 
                ? 'opacity-60 border-gray-700 bg-black/40' 
                : getIngressosStatus() === 'disponivel'
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-red-500/50 bg-red-500/10'
            }`}
          >
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">{ingressosInfo.title}</p>
              <p className={`text-xl font-bold mb-1 ${
                getIngressosStatus() === 'em_breve' 
                  ? 'text-pink-500' 
                  : getIngressosStatus() === 'disponivel'
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}>
                {ingressosInfo.subtitle}
              </p>
              <p className="text-xs text-gray-500">{ingressosInfo.description}</p>
              
              {/* Contagem regressiva detalhada */}
              {getIngressosStatus() === 'em_breve' && countdown.days > 0 && (
                <div className="mt-3 text-xs text-gray-400">
                  <div className="flex justify-center space-x-2">
                    <span>{countdown.days}d</span>
                    <span>{countdown.hours}h</span>
                    <span>{countdown.minutes}m</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Card de Indicações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-xl p-6 border border-blue-500/50 bg-blue-500/10"
          >
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">👥 Indicações</p>
              <p className="text-2xl font-bold text-blue-400 mb-1">
                {data.indicacoes.total.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                +{data.indicacoes.hoje} hoje
              </p>
            </div>
          </motion.div>

          {/* Card de Fotógrafos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="rounded-xl p-6 border border-purple-500/50 bg-purple-500/10"
          >
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">📸 Fotógrafos</p>
              <p className="text-2xl font-bold text-purple-400 mb-1">
                {data.fotografos.total}
              </p>
              <p className="text-xs text-gray-500">
                {data.fotografos.aprovados} aprovados
              </p>
            </div>
          </motion.div>

          {/* Card de XP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="rounded-xl p-6 border border-pink-500/50 bg-pink-500/10"
          >
            <div className="text-center">
                              <p className="text-sm text-gray-400 mb-2">⭐ $BOX Total</p>
              <p className="text-2xl font-bold text-pink-400 mb-1">
                {data.xp.total.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Média: {data.xp.media} $BOX
              </p>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-8 border border-pink-500/30">
            <h3 className="text-xl font-bold text-white mb-4">
              {isIngressosDisponiveis() 
                ? '🎯 Ingressos já estão disponíveis!' 
                : '⏰ Prepare-se para a abertura'
              }
            </h3>
            <p className="text-gray-400 mb-6">
              {isIngressosDisponiveis()
                ? 'Não perca a chance de participar do maior evento de times da América Latina.'
                : 'Entre na comunidade oficial e receba notificações em primeira mão.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isIngressosDisponiveis() ? (
                <Link href="/times" passHref legacyBehavior>
                  <a
                    className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200"
                  >
                    🎫 Comprar Ingresso
                  </a>
                </Link>
              ) : (
                <a
                  href="https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-all duration-200"
                >
                  📲 Entrar na Comunidade
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TempoReal; 