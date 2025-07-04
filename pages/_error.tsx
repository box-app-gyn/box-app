import { NextPageContext } from 'next'
import { ErrorProps } from 'next/error'

interface CustomErrorProps extends ErrorProps {
  hasGetInitialPropsRun?: boolean
  err?: Error
}

function Error({ statusCode, hasGetInitialPropsRun, err }: CustomErrorProps) {
  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    console.error('Error:', err)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="text-6xl font-bold text-red-500 mb-4">
          {statusCode || '500'}
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          {statusCode === 404 ? 'Página não encontrada' : 'Erro interno'}
        </h1>
        <p className="text-gray-600 mb-6">
          {statusCode === 404 
            ? 'A página que você está procurando não existe.'
            : 'Algo deu errado. Tente novamente mais tarde.'
          }
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const errorInitialProps: CustomErrorProps = {
    hasGetInitialPropsRun: true,
    err: err ?? undefined,
    statusCode: 500, // valor padrão
  }

  // Early return if we have a custom error page
  if (res?.statusCode === 404) {
    return errorInitialProps
  }

  // Workaround for https://github.com/vercel/next.js/issues/8592, mark when
  // getInitialProps has run
  errorInitialProps.hasGetInitialPropsRun = true

  // Running on the server, and response status code and error are available
  if (res) {
    errorInitialProps.statusCode = res.statusCode
  }

  // Running on the client (browser)
  if (err) {
    errorInitialProps.statusCode = err.statusCode || 500
  }

  return errorInitialProps
}

export default Error 