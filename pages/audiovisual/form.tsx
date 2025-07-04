import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import { useAnalytics } from '@/hooks/useAnalytics';
import SEOHead from '@/components/SEOHead';
import PIXQRCode from '@/components/PIXQRCode';

interface AudiovisualForm {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  areaAtuacao: string;
  experiencia: string;
  portfolio: string;
  equipamentos: string;
  disponibilidade: string;
  motivacao: string;
}

type FormStep = 'category' | 'summary' | 'form' | 'payment' | 'confirmation';

const CATEGORIES = [
  { id: 'fotografia', name: '📸 Fotografia', description: 'Cobertura fotográfica do evento' },
  { id: 'video', name: '🎥 Vídeo', description: 'Produção de vídeos e conteúdo audiovisual' },
  { id: 'drone', name: '🚁 Drone', description: 'Imagens aéreas e cinematografia' },
  { id: 'social', name: '📱 Social Media', description: 'Gestão de redes sociais e conteúdo' },
  { id: 'podcast', name: '🎙️ Podcast', description: 'Criação de conteúdo em áudio' },
  { id: 'midia', name: '📰 Mídia', description: 'Cobertura jornalística e editorial' }
];

const LOTES = {
  fotografia: { nome: 'Fotógrafo', valor: 150, vagas: 8 },
  video: { nome: 'Videomaker', valor: 200, vagas: 6 },
  drone: { nome: 'Piloto de Drone', valor: 250, vagas: 4 },
  social: { nome: 'Social Media', valor: 180, vagas: 5 },
  podcast: { nome: 'Podcaster', valor: 120, vagas: 10 },
  midia: { nome: 'Mídia', valor: 100, vagas: 12 }
};

export default function AudiovisualFormPage() {
  const [currentStep, setCurrentStep] = useState<FormStep>('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState<AudiovisualForm>({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    estado: '',
    areaAtuacao: '',
    experiencia: '',
    portfolio: '',
    equipamentos: '',
    disponibilidade: '',
    motivacao: ''
  });
  const [error, setError] = useState('');
  const { trackPage, trackFormSubmit, trackAudiovisual } = useAnalytics();

  useEffect(() => {
    trackPage('audiovisual_form');
    trackAudiovisual('view_form', 'candidatura_audiovisual');
  }, [trackPage, trackAudiovisual]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFormData(prev => ({ ...prev, areaAtuacao: categoryId }));
    setCurrentStep('summary');
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'summary':
        setCurrentStep('form');
        break;
      case 'form':
        setCurrentStep('payment');
        break;
    }
  };

  const handlePrevStep = () => {
    switch (currentStep) {
      case 'summary':
        setCurrentStep('category');
        break;
      case 'form':
        setCurrentStep('summary');
        break;
      case 'payment':
        setCurrentStep('form');
        break;
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSuccess = async () => {
    try {
      const audiovisualData = {
        ...formData,
        status: 'pendente',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'audiovisual', `${Date.now()}-${formData.email}`), audiovisualData);
      
      trackFormSubmit('formulario_audiovisual');
      trackAudiovisual('submit_form', `${formData.areaAtuacao}_${formData.cidade}`);
      
      setTimeout(() => {
        setCurrentStep('confirmation');
      }, 2000);
    } catch {
      setError('Erro ao processar inscrição. Tente novamente.');
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'category':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha sua área</h2>
              <p className="text-gray-600">Selecione a categoria que melhor representa sua atuação</p>
            </div>
            
            <div className="grid gap-4">
              {CATEGORIES.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategorySelect(category.id)}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl text-left hover:border-pink-500 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <div className="text-pink-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'summary':
        const lote = LOTES[selectedCategory as keyof typeof LOTES];
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Resumo da inscrição</h2>
              <p className="text-gray-600">Confirme os detalhes antes de continuar</p>
            </div>
            
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{lote.nome}</h3>
                <span className="text-2xl font-bold text-pink-600">R$ {lote.valor}</span>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Vagas disponíveis:</span>
                  <span className="font-semibold">{lote.vagas} vagas</span>
                </div>
                <div className="flex justify-between">
                  <span>Inclui:</span>
                  <span className="font-semibold">Acesso VIP + Kit oficial</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-semibold">Disponível</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handlePrevStep}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors font-semibold"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        );

      case 'form':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seus dados</h2>
              <p className="text-gray-600">Preencha suas informações para completar a inscrição</p>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="Sua cidade"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experiência *</label>
                <textarea
                  name="experiencia"
                  value={formData.experiencia}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  placeholder="Conte sobre sua experiência na área..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Portfólio/Link *</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  placeholder="https://seu-portfolio.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivação *</label>
                <textarea
                  name="motivacao"
                  value={formData.motivacao}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  placeholder="Por que você quer participar do CERRADØ INTERBOX?"
                  required
                />
              </div>
            </form>
            
            <div className="flex space-x-4">
              <button
                onClick={handlePrevStep}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleNextStep}
                disabled={!formData.nome || !formData.email || !formData.telefone}
                className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        );

             case 'payment':
         const lotePayment = LOTES[selectedCategory as keyof typeof LOTES];
         return (
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="space-y-6"
           >
             <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento</h2>
               <p className="text-gray-600">Escaneie o QR Code para finalizar sua inscrição</p>
             </div>
             
             <PIXQRCode
               valor={lotePayment.valor}
               categoria={lotePayment.nome}
               onPaymentSuccess={handlePaymentSuccess}
               onPaymentError={handlePaymentError}
             />
             
             <button
               onClick={handlePrevStep}
               className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
             >
               Voltar
             </button>
           </motion.div>
         );

      case 'confirmation':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscrição Confirmada!</h2>
              <p className="text-gray-600 mb-6">
                Sua candidatura foi enviada com sucesso. Entraremos em contato em breve.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4"
            >
              <p className="text-sm text-green-800">
                <strong>Próximos passos:</strong><br/>
                • Aguarde nosso contato por email<br/>
                • Prepare seu portfólio<br/>
                • Fique atento às atualizações
              </p>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => window.close()}
              className="w-full px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors font-semibold"
            >
              Fechar
            </motion.button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <SEOHead 
        title="Candidatura Audiovisual - CERRADØ INTERBOX 2025"
        description="Candidate-se para fazer parte da equipe audiovisual do CERRADØ INTERBOX 2025. Eternize a intensidade do maior evento de times da América Latina."
        image="/images/og-interbox.png"
        type="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <Header />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-md mx-auto relative z-10">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Etapa {['category', 'summary', 'form', 'payment', 'confirmation'].indexOf(currentStep) + 1} de 5</span>
                <span className="text-sm font-medium text-gray-900">
                  {currentStep === 'category' && 'Categoria'}
                  {currentStep === 'summary' && 'Resumo'}
                  {currentStep === 'form' && 'Dados'}
                  {currentStep === 'payment' && 'Pagamento'}
                  {currentStep === 'confirmation' && 'Concluído'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-pink-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((['category', 'summary', 'form', 'payment', 'confirmation'].indexOf(currentStep) + 1) / 5) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
            {/* Step Content */}
            <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[500px]">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>
          </div>
        </main>
        
        <style jsx global>{`
          /* Forçar orientação vertical */
          @media screen and (orientation: landscape) and (max-height: 600px) {
            body {
              transform: rotate(90deg);
              transform-origin: left top;
              width: 100vh;
              height: 100vw;
              overflow-x: hidden;
              position: absolute;
              top: 100%;
              left: 0;
            }
          }
          
          /* Layout mobile-first */
          @media (max-width: 768px) {
            body {
              overflow-x: hidden;
            }
            
            main {
              padding-left: 1rem;
              padding-right: 1rem;
            }
            
            .max-w-md {
              max-width: 100%;
            }
          }
          
          /* Prevenir scroll horizontal */
          html, body {
            overflow-x: hidden;
            max-width: 100vw;
          }
          
          /* Animações suaves */
          .step-transition {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          /* Estados de loading */
          .loading-spinner {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          /* Checkmark animation */
          .checkmark-animation {
            animation: checkmark 0.5s ease-in-out;
          }
          
          @keyframes checkmark {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    </>
  );
} 