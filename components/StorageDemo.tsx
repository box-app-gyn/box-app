import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function StorageDemo() {
  const {
    formData,
    saveFormData,
    clearFormData,
    savePartialData,
    teamData,
    saveTeamData,
    clearTeamData,
    categoria,
    saveCategoria,
    clearCategoria,
    paymentStatus,
    savePaymentStatus,
    clearPaymentStatus,
    clearAllData,
    hasSavedData,
    getAllSavedData
  } = useLocalStorage();

  const [formInputs, setFormInputs] = useState({
    nome: '',
    email: '',
    telefone: '',
    time: ''
  });

  const [teamInputs, setTeamInputs] = useState({
    nomeTime: '',
    categoria: '',
    integrantes: ''
  });

  // Carregar dados salvos nos inputs
  React.useEffect(() => {
    setFormInputs({
      nome: formData.nome || '',
      email: formData.email || '',
      telefone: formData.telefone || '',
      time: formData.time || ''
    });

    setTeamInputs({
      nomeTime: teamData.nomeTime || '',
      categoria: teamData.categoria || '',
      integrantes: teamData.integrantes?.join(', ') || ''
    });
  }, [formData, teamData]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveFormData(formInputs);
  };

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveTeamData({
      ...teamInputs,
      integrantes: teamInputs.integrantes.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  const handlePartialSave = (key: string, value: string) => {
    savePartialData(key, value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">💾 Sistema de Storage Local</h1>

      {/* Status Geral */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">📊 Status Geral</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>Categoria:</strong> {categoria || 'Não definida'}
          </div>
          <div>
            <strong>Status Pagamento:</strong> {paymentStatus || 'Não definido'}
          </div>
          <div>
            <strong>Dados Salvos:</strong> {hasSavedData() ? 'Sim' : 'Não'}
          </div>
          <div>
            <strong>Timestamp:</strong> {formData.timestamp ? new Date(formData.timestamp).toLocaleString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Controles de Categoria e Pagamento */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">🏷️ Categoria</h3>
          <div className="space-y-2">
            {['atleta', 'espectador', 'organizador'].map(cat => (
              <button
                key={cat}
                onClick={() => saveCategoria(cat)}
                className={`w-full p-2 rounded ${categoria === cat ? 'bg-blue-500 text-white' : 'bg-white border'}`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={clearCategoria}
              className="w-full p-2 bg-red-500 text-white rounded"
            >
              Limpar Categoria
            </button>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">💳 Status Pagamento</h3>
          <div className="space-y-2">
            {(['pendente', 'pago', 'cancelado'] as const).map(status => (
              <button
                key={status}
                onClick={() => savePaymentStatus(status)}
                className={`w-full p-2 rounded ${paymentStatus === status ? 'bg-green-500 text-white' : 'bg-white border'}`}
              >
                {status}
              </button>
            ))}
            <button
              onClick={clearPaymentStatus}
              className="w-full p-2 bg-red-500 text-white rounded"
            >
              Limpar Status
            </button>
          </div>
        </div>
      </div>

      {/* Formulário Individual */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">👤 Formulário Individual</h3>
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nome"
              value={formInputs.nome}
              onChange={(e) => setFormInputs(prev => ({ ...prev, nome: e.target.value }))}
              className="p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formInputs.email}
              onChange={(e) => setFormInputs(prev => ({ ...prev, email: e.target.value }))}
              className="p-2 border rounded"
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={formInputs.telefone}
              onChange={(e) => setFormInputs(prev => ({ ...prev, telefone: e.target.value }))}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Time (opcional)"
              value={formInputs.time}
              onChange={(e) => setFormInputs(prev => ({ ...prev, time: e.target.value }))}
              className="p-2 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Salvar Formulário
            </button>
            <button
              type="button"
              onClick={clearFormData}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Limpar Formulário
            </button>
          </div>
        </form>
      </div>

      {/* Formulário de Time */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">👥 Formulário de Time</h3>
        <form onSubmit={handleTeamSubmit} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nome do Time"
              value={teamInputs.nomeTime}
              onChange={(e) => setTeamInputs(prev => ({ ...prev, nomeTime: e.target.value }))}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Categoria"
              value={teamInputs.categoria}
              onChange={(e) => setTeamInputs(prev => ({ ...prev, categoria: e.target.value }))}
              className="p-2 border rounded"
            />
          </div>
          <textarea
            placeholder="Integrantes (separados por vírgula)"
            value={teamInputs.integrantes}
            onChange={(e) => setTeamInputs(prev => ({ ...prev, integrantes: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-purple-500 text-white rounded">
              Salvar Time
            </button>
            <button
              type="button"
              onClick={clearTeamData}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Limpar Time
            </button>
          </div>
        </form>
      </div>

      {/* Dados Parciais */}
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">📝 Dados Parciais</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Chave"
              id="partialKey"
              className="flex-1 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Valor"
              id="partialValue"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={() => {
                const key = (document.getElementById('partialKey') as HTMLInputElement).value;
                const value = (document.getElementById('partialValue') as HTMLInputElement).value;
                if (key && value) {
                  handlePartialSave(key, value);
                  (document.getElementById('partialKey') as HTMLInputElement).value = '';
                  (document.getElementById('partialValue') as HTMLInputElement).value = '';
                }
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded"
            >
              Salvar
            </button>
          </div>
          <div className="text-sm">
            <strong>Dados parciais salvos:</strong>
            <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(formData.dadosParciais || {}, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Dados Salvos */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">💾 Dados Salvos</h3>
        <div className="space-y-4">
          <div>
            <strong>Formulário:</strong>
            <pre className="mt-1 bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
          <div>
            <strong>Time:</strong>
            <pre className="mt-1 bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(teamData, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Controles Finais */}
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🗑️ Limpeza</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={clearFormData}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Limpar Formulário
          </button>
          <button
            onClick={clearTeamData}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Limpar Time
          </button>
          <button
            onClick={clearCategoria}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Limpar Categoria
          </button>
          <button
            onClick={clearPaymentStatus}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Limpar Pagamento
          </button>
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-700 text-white rounded font-bold"
          >
            🗑️ LIMPAR TUDO
          </button>
        </div>
      </div>

      {/* Debug */}
      <div className="bg-black text-green-400 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🐛 Debug - Todos os Dados</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(getAllSavedData(), null, 2)}
        </pre>
      </div>
    </div>
  );
} 