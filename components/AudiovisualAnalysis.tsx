import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalysisResult {
  score: number;
  feedback: string;
  recommendations: string[];
}

export default function AudiovisualAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [formData, setFormData] = useState({
    areaAtuacao: '',
    experiencia: '',
    portfolio: '',
    equipamentos: '',
  });
  const { trackAudiovisual } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      trackAudiovisual('analyze_profile', 'audiovisual_analysis');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_profile',
          profile: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setResult(data.data);
    } catch (error) {
      console.error('Erro na análise:', error);
      setResult({
        score: 70,
        feedback: 'Análise temporariamente indisponível. Sua candidatura será avaliada pela nossa equipe.',
        recommendations: [
          'Certifique-se de que seu portfólio está atualizado',
          'Descreva sua experiência de forma detalhada',
          'Mencione equipamentos específicos que você utiliza'
        ],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    return 'Precisa melhorar';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 backdrop-blur-lg border border-pink-500/30 rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            🤖 Análise IA do Perfil Audiovisual
          </h2>
          <p className="text-gray-300">
            Nossa IA especializada analisará seu perfil e fornecerá feedback personalizado
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Área de Atuação *
                </label>
                <select
                  value={formData.areaAtuacao}
                  onChange={(e) => handleInputChange('areaAtuacao', e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-pink-500"
                >
                  <option value="">Selecione sua área</option>
                  <option value="Fotografia">Fotografia</option>
                  <option value="Vídeo">Vídeo</option>
                  <option value="Drone">Drone</option>
                  <option value="Pós-produção">Pós-produção</option>
                  <option value="Direção Criativa">Direção Criativa</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Múltiplas áreas">Múltiplas áreas</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Anos de Experiência *
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experiencia}
                  onChange={(e) => handleInputChange('experiencia', e.target.value)}
                  required
                  placeholder="Ex: 3"
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Portfólio/Experiência *
              </label>
              <textarea
                value={formData.portfolio}
                onChange={(e) => handleInputChange('portfolio', e.target.value)}
                required
                rows={4}
                placeholder="Descreva sua experiência, trabalhos realizados, eventos que cobriu, etc..."
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Equipamentos *
              </label>
              <textarea
                value={formData.equipamentos}
                onChange={(e) => handleInputChange('equipamentos', e.target.value)}
                required
                rows={3}
                placeholder="Liste os equipamentos que você utiliza (câmeras, lentes, drones, etc...)"
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:bg-gray-600 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Analisando...
                  </div>
                ) : (
                  '🔍 Analisar Perfil'
                )}
              </button>
            </div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Score */}
            <div className="text-center">
              <div className="inline-flex items-center gap-4 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}/100
                  </div>
                  <div className="text-gray-300 text-sm">{getScoreLabel(result.score)}</div>
                </div>
                <div className="w-px h-16 bg-gray-600"></div>
                <div className="text-left">
                  <h3 className="text-white font-medium mb-2">Análise IA</h3>
                  <p className="text-gray-300 text-sm">
                    Baseado em sua experiência e equipamentos
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-medium mb-3">📝 Feedback Detalhado</h3>
              <div className="text-gray-300 text-sm whitespace-pre-wrap">
                {result.feedback}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-medium mb-3">💡 Recomendações</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300 text-sm">
                    <span className="text-pink-400 mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setResult(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                🔄 Nova Análise
              </button>
              <a
                href="https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                💬 Falar com Equipe
              </a>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 