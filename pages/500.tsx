import Head from 'next/head'
import Link from 'next/link'

export default function Custom500() {
  return (
    <>
      <Head>
        <title>Erro interno - Cerrado Interbox</title>
        <meta name="description" content="Erro interno do servidor" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="text-6xl font-bold text-red-500 mb-4">500</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Erro interno
          </h1>
          <p className="text-gray-600 mb-6">
            Algo deu errado no servidor. Tente novamente mais tarde.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Ir para o início
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 