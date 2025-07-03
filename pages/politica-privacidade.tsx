import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import SEOHead from '@/components/SEOHead';

export default function PoliticaPrivacidade() {
  return (
    <>
      <SEOHead 
        title="Política de Privacidade - CERRADØ INTERBOX 2025"
        description="Política de privacidade do CERRADØ INTERBOX 2025. Saiba como coletamos, usamos e protegemos seus dados pessoais."
        image="/images/og-interbox.png"
        type="website"
        keywords="política de privacidade, LGPD, proteção de dados, CERRADØ INTERBOX"
        tags={["privacidade", "LGPD", "proteção de dados"]}
        canonical="https://cerradointerbox.com.br/politica-privacidade"
        noIndex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0]">
        <Header />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Image
              src="/logos/logo_circulo.png"
              alt="Interbox 2025 Logo"
              width={80}
              height={80}
              className="mx-auto mb-6 drop-shadow-[0_2px_12px_rgba(255,27,221,0.7)]"
            />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 headline-glow">
              Política de Privacidade
            </h1>
            <p className="text-gray-400">
              Última atualização: Junho de 2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-black/60 backdrop-blur rounded-xl p-8 shadow-lg border border-pink-500/20">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                A sua privacidade é prioridade para nós. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados no ecossistema digital do <strong>Cerrado Interbox 2025</strong>, operado pela equipe da FlowOFF em parceria com a organização oficial do evento.
              </p>

              <div className="space-y-8">
                {/* Coleta de Dados */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    📥 Coleta de Dados
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Coletamos informações que você fornece diretamente:
                  </p>
                  <ul className="text-gray-300 space-y-2 ml-6">
                    <li>• Nome, e-mail, telefone e dados de inscrição</li>
                    <li>• Informações enviadas em formulários ou interações no site</li>
                    <li>• Dados de navegação no WebApp ou site</li>
                  </ul>
                </section>

                {/* Uso dos Dados */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    🧠 Uso dos Dados
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Utilizamos seus dados para:
                  </p>
                  <ul className="text-gray-300 space-y-2 ml-6">
                    <li>• Processar inscrições e pagamentos</li>
                    <li>• Gerenciar o ranking, desafios e recompensas</li>
                    <li>• Comunicar novidades, atualizações e conteúdos do evento</li>
                    <li>• Oferecer suporte e experiências personalizadas</li>
                  </ul>
                </section>

                {/* Armazenamento e Segurança */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    🔒 Armazenamento e Segurança
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Seus dados são armazenados em servidores seguros com criptografia e acesso restrito. Utilizamos práticas atualizadas de segurança digital e proteção contra acessos não autorizados.
                  </p>
                </section>

                {/* Compartilhamento */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    🤝 Compartilhamento
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Seus dados <strong>não são vendidos ou comercializados</strong>. Podemos compartilhá-los apenas com parceiros essenciais para:
                  </p>
                  <ul className="text-gray-300 space-y-2 ml-6">
                    <li>• Processamento de pagamentos (via FlowPay)</li>
                    <li>• Envio de comunicações e atendimento</li>
                    <li>• Ativações patrocinadas, com seu consentimento</li>
                  </ul>
                </section>

                {/* Direitos do Usuário */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    📲 Direitos do Usuário
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Você pode, a qualquer momento:
                  </p>
                  <ul className="text-gray-300 space-y-2 ml-6">
                    <li>• Solicitar acesso ou alteração de seus dados</li>
                    <li>• Pedir exclusão definitiva dos seus dados</li>
                    <li>• Cancelar o recebimento de comunicações</li>
                  </ul>
                  <p className="text-gray-300 mt-4">
                    Entre em contato: <strong className="text-pink-400">contato@cerradointerbox.com.br</strong>
                  </p>
                </section>

                {/* Cookies */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    👁️ Cookies
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Utilizamos cookies para melhorar sua navegação e lembrar preferências. Ao continuar no site, você concorda com nossa política de cookies.
                  </p>
                </section>

                {/* LGPD */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    ⚖️ LGPD
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Estamos 100% alinhados à Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). Seus dados serão sempre tratados com responsabilidade e transparência.
                  </p>
                </section>

                {/* Contato */}
                <section className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 rounded-xl p-6 border border-pink-500/20">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Dúvidas?
                  </h2>
                  <p className="text-gray-300">
                    Fale com a gente: <strong className="text-pink-400">interbox25cerrado@gmail.com</strong>
                  </p>
                </section>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <button
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
} 