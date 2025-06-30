import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

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

export default function AudiovisualFormPage() {
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const audiovisualData = {
        ...formData,
        status: 'pendente',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await setDoc(doc(db, 'audiovisual', `${Date.now()}-${formData.email}`), audiovisualData);
      setSuccess(true);
      setTimeout(() => {
        window.close();
      }, 3000);
    } catch (error: unknown) {
      setError('Erro ao enviar formulário. Tente novamente.');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Header />
      {/* BG grunge com textura de ruído */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="w-full h-full bg-[url('/images/bg_grunge.png')], bg-repeat opacity-20 mix-blend-multiply"></div>
      </div>
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <Image
              src="/logos/nome_hrz.png"
              alt="CERRADØ 𝗜𝗡𝗧𝗘𝗥𝗕𝗢𝗫 Logo"
              width={320}
              height={90}
              className="mx-auto mb-6 logo-grunge"
              style={{ filter: 'brightness(0) invert(0)', maxWidth: '90vw', height: 'auto' }}
              priority
            />
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight glitch-text">
              Formulário de Candidatura
            </h2>
            <p className="text-gray-600 mb-2">Preencha seus dados para participar do time audiovisual da CERRADØ 𝗜𝗡𝗧𝗘𝗥𝗕𝗢𝗫.</p>
          </div>
          <div className="bg-gray-50 border border-pink-300 rounded-2xl shadow-[0_8px_32px_0_rgba(236,72,153,0.25)] p-8 text-left relative grunge-card">
            {success ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎬</div>
                <h2 className="text-2xl font-bold text-green-400 mb-4">
                  Candidatura Enviada!
                </h2>
                <p className="text-gray-700 mb-6">
                  Obrigado por se candidatar! Esta janela será fechada automaticamente.
                </p>
                <div className="animate-pulse text-pink-400">
                  Fechando...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-900 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-900 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cidade" className="block text-sm font-medium text-gray-900 mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      placeholder="Sua cidade"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-900 mb-2">
                      Estado *
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      required
                    >
                      <option value="">Selecione seu estado</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="areaAtuacao" className="block text-sm font-medium text-gray-900 mb-2">
                      Área de Atuação *
                    </label>
                    <select
                      id="areaAtuacao"
                      name="areaAtuacao"
                      value={formData.areaAtuacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      required
                    >
                      <option value="">Selecione sua área</option>
                      <option value="fotografia">Fotografia</option>
                      <option value="video">Vídeo</option>
                      <option value="drone">Drone</option>
                      <option value="edicao">Edição</option>
                      <option value="iluminacao">Iluminação</option>
                      <option value="som">Som</option>
                      <option value="direcao">Direção</option>
                      <option value="producao">Produção</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="experiencia" className="block text-sm font-medium text-gray-900 mb-2">
                      Anos de Experiência *
                    </label>
                    <select
                      id="experiencia"
                      name="experiencia"
                      value={formData.experiencia}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      required
                    >
                      <option value="">Selecione sua experiência</option>
                      <option value="0-1">0-1 ano</option>
                      <option value="1-3">1-3 anos</option>
                      <option value="3-5">3-5 anos</option>
                      <option value="5-10">5-10 anos</option>
                      <option value="10+">10+ anos</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="portfolio" className="block text-sm font-medium text-gray-900 mb-2">
                      Portfólio/Links
                    </label>
                    <textarea
                      id="portfolio"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      placeholder="Links do seu portfólio, Instagram, YouTube, etc."
                    />
                  </div>
                  <div>
                    <label htmlFor="equipamentos" className="block text-sm font-medium text-gray-900 mb-2">
                      Equipamentos
                    </label>
                    <textarea
                      id="equipamentos"
                      name="equipamentos"
                      value={formData.equipamentos}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      placeholder="Descreva os equipamentos que você possui"
                    />
                  </div>
                  <div>
                    <label htmlFor="disponibilidade" className="block text-sm font-medium text-gray-900 mb-2">
                      Disponibilidade *
                    </label>
                    <select
                      id="disponibilidade"
                      name="disponibilidade"
                      value={formData.disponibilidade}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      required
                    >
                      <option value="">Selecione sua disponibilidade</option>
                      <option value="integral">Tempo integral</option>
                      <option value="parcial">Tempo parcial</option>
                      <option value="finais-semana">Finais de semana</option>
                      <option value="flexivel">Horário flexível</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="motivacao" className="block text-sm font-medium text-gray-900 mb-2">
                      Por que você quer participar? *
                    </label>
                    <textarea
                      id="motivacao"
                      name="motivacao"
                      value={formData.motivacao}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      placeholder="Conte-nos sua motivação para participar do CERRADØ 𝗜𝗡𝗧𝗘𝗥𝗕𝗢𝗫"
                      required
                    />
                  </div>
                </div>
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-pink-600 to-black text-white font-bold py-4 px-8 rounded-lg hover:from-pink-700 hover:to-black transition-all duration-200 shadow-[0_0_20px_#E50914] hover:shadow-[0_0_40px_#E50914] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      'Enviar Candidatura'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <style jsx>{`
        .glitch-text {
          position: relative;
          color: #111;
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
        .logo-grunge {
          transition: transform 0.3s;
        }
        @media (min-width: 768px) {
          .logo-grunge {
            transform: translateX(26%);
          }
        }
      `}</style>
    </div>
  );
} 