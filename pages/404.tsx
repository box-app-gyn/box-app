import React from 'react';
import Head from 'next/head';
import Link from 'next/link'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Página não encontrada - Cerrado Interbox</title>
        <meta name="description" content="Página não encontrada" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="text-6xl font-bold text-red-500 mb-4">404</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Página não encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Ir para o início
            </Link>
            <button
              onClick={() => window.history.back()}
              className="block w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 