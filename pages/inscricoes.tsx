import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import InscricoesSection from '../components/InscricoesSection';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function InscricoesPage() {
  return (
    <>
      <Head>
        <title>Inscrições - Interbox 2025</title>
        <meta name="description" content="Inscreva-se no maior evento de CrossFit do Centro-Oeste. Categoria RX e demais categorias disponíveis." />
        <meta name="keywords" content="interbox, crossfit, inscrições, competição, cerrado" />
        <meta property="og:title" content="Inscrições - Interbox 2025" />
        <meta property="og:description" content="Garanta sua vaga no maior evento de CrossFit do Centro-Oeste!" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logos/oficial_logo.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0]">
        <Header />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Section */}
          <section className="pt-32 pb-20 text-center">
            <div className="container mx-auto px-4">
              <motion.h1
                className="text-5xl md:text-7xl font-bold text-white mb-6"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                INSCRIÇÕES
              </motion.h1>
              <motion.p
                className="text-2xl text-pink-400 font-tech mb-4"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                PRIMEIRO LOTE - Vagas Limitadas
              </motion.p>
              <motion.div
                className="w-32 h-1 bg-pink-500 mx-auto mb-8"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              ></motion.div>
              <motion.p
                className="text-xl text-gray-300 max-w-3xl mx-auto"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                O maior evento de CrossFit do Centro-Oeste está de volta! 
                Garanta sua vaga agora e faça parte desta experiência única.
              </motion.p>
            </div>
          </section>

          {/* Seção de Inscrições */}
          <InscricoesSection />

          {/* Seção de Benefícios */}
          <section className="py-20 bg-black/40">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-6">
                  O QUE ESTÁ INCLUÍDO
                </h2>
                <p className="text-xl text-gray-300">
                  Sua inscrição inclui muito mais que apenas a competição
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <motion.div
                  className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-8 text-center"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Kit do Atleta</h3>
                  <p className="text-gray-300">
                    Camiseta exclusiva, medalha personalizada, brindes especiais e muito mais!
                  </p>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-8 text-center"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Experiência Completa</h3>
                  <p className="text-gray-300">
                    Acesso a todas as atividades, workshops, área de aquecimento e suporte técnico.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-8 text-center"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl mb-4">📸</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Fotos e Vídeos</h3>
                  <p className="text-gray-300">
                    Cobertura fotográfica e videográfica profissional incluída na inscrição.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Seção de FAQ */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-6">
                  PERGUNTAS FREQUENTES
                </h2>
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                <motion.div
                  className="bg-black/40 border border-pink-500/30 rounded-xl p-6"
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-bold text-white mb-3">
                    Como funciona o pagamento?
                  </h3>
                  <p className="text-gray-300">
                    O pagamento é processado de forma segura através da plataforma InfinitePay. 
                    Você receberá confirmação imediata após o pagamento.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-black/40 border border-pink-500/30 rounded-xl p-6"
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-bold text-white mb-3">
                    Posso cancelar minha inscrição?
                  </h3>
                  <p className="text-gray-300">
                    Sim, você pode solicitar cancelamento até 30 dias antes do evento. 
                    Entre em contato conosco para mais informações.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-black/40 border border-pink-500/30 rounded-xl p-6"
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-bold text-white mb-3">
                    Qual categoria devo escolher?
                  </h3>
                  <p className="text-gray-300">
                    A categoria RX é para atletas experientes. As demais categorias incluem 
                    Scaled, Masters, Teens e outras opções para todos os níveis.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        </motion.main>

        <Footer />
      </div>
    </>
  );
} 