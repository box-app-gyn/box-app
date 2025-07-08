import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* React DevTools - apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <script src="http://localhost:8097" />
        )}
      </Head>
      <body className="bg-gray-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 