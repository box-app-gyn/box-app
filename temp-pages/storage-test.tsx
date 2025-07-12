import React from 'react';
import Head from 'next/head';
import StorageDemo from '../components/StorageDemo';

export default function StorageTestPage() {
  return (
    <>
      <Head>
        <title>💾 Teste de Storage - CERRADØ</title>
        <meta name="description" content="Teste do sistema de storage local" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto py-8">
          <StorageDemo />
        </div>
      </div>
    </>
  );
} 