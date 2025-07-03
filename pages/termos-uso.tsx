import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import SEOHead from '@/components/SEOHead';

export default function TermosUso() {
  return (
    <>
      <SEOHead 
        title="Termos de Uso - CERRADØ INTERBOX 2025"
        description="Termos de uso do CERRADØ INTERBOX 2025. Conheça as condições para utilização da plataforma e participação no evento."
        image="/images/og-interbox.png"
        type="website"
        keywords="termos de uso, condições, CERRADØ INTERBOX, regulamento"
        tags={["termos", "condições", "regulamento"]}
        canonical="https://cerradointerbox.com.br/termos-uso"
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
              Termos de Uso
            </h1>
            <p className="text-gray-400">
              Bem-vindo ao Cerrado Interbox 2025!
            </p>
          </div>

          {/* Content */}
          <div className="bg-black/60 backdrop-blur rounded-xl p-8 shadow-lg border border-pink-500/20">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Estes Termos de Uso regulam a utilização do site, WebApp e demais plataformas digitais oficiais do evento. Ao acessar, você concorda com as condições descritas abaixo.
              </p>

              <div className="space-y-8">
                {/* Uso da Plataforma */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    📌 Uso da Plataforma
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Você se compromete a:
                  </p>
                  <ul className="text-gray-300 space-y-2 ml-6">
                    <li>• Fornecer informações verdadeiras no momento da inscrição</li>
                    <li>• Utilizar a plataforma com responsabilidade e respeito</li>
                    <li>• Não divulgar ou copiar conteúdo sem autorização</li>
                  </ul>
                </section>

                {/* Inscrições e Pagamentos */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    🎫 Inscrições e Pagamentos
                  </h2>
                  <ul className="text-gray-300 space-y-2 ml-6">
                    <li>• As inscrições são pessoais e intransferíveis</li>
                    <li>• Pagamentos são processados pelo sistema <strong>FlowPay</strong></li>
                    <li>• O não pagamento até a data limite resultará no cancelamento da vaga</li>
                    <li>• Em caso de desistência, consulte a política de reembolso no regulamento oficial</li>
                  </ul>
                </section>

                {/* Propriedade Intelectual */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    🧠 Propriedade Intelectual
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Todo o conteúdo do site, imagens, vídeos, identidade visual, nomes e marcas são propriedade do <strong>Cerrado Interbox</strong> e/ou <strong>FlowOFF</strong>. É proibida sua reprodução sem autorização prévia.
                  </p>
                </section>

                {/* Participação no Evento */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    🎥 Participação no Evento
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Ao se inscrever, você autoriza o uso da sua imagem para fins de divulgação e registro do evento, incluindo fotos, vídeos e transmissões.
                  </p>
                </section>

                {/* Suspensão ou Alterações */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    🛠️ Suspensão ou Alterações
                  </h2>
                  <p className="text-gray-300 mb-4">
                    A organização se reserva o direito de:
                  </p>
                  <ul className="text-gray-300 space-y-2 ml-6">
                    <li>• Suspender ou modificar o evento por força maior</li>
                    <li>• Ajustar datas e formatos conforme necessário</li>
                    <li>• Atualizar estes termos sem aviso prévio (publicaremos a nova versão no site)</li>
                  </ul>
                </section>

                {/* Atendimento */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    💬 Atendimento
                  </h2>
                  <p className="text-gray-300 mb-2">
                    Dúvidas, sugestões ou problemas técnicos?
                  </p>
                  <p className="text-gray-300">
                    Fale com a gente: <strong className="text-pink-400">interbox25cerrado@gmail.com</strong>
                  </p>
                </section>

                {/* Aceite */}
                <section className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 rounded-xl p-6 border border-pink-500/20">
                  <h2 className="text-xl font-bold text-white mb-4">
                    ✅ Aceite
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Ao utilizar este site e se inscrever no evento, você declara estar de acordo com os Termos de Uso e a Política de Privacidade.
                  </p>
                  <p className="text-gray-300 font-semibold">
                    A gente se vê na arena.<br />
                    <span className="text-pink-400">#CerradoInterbox2025</span>
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