import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import ChatButton from '@/components/ChatButton';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Google Analytics - apenas em produção */}
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
      
      <div className="bg-animated-gradient" />
      <Component {...pageProps} />
      
      {/* Chat Button - apenas em produção */}
      <ChatButton />
    </>
  );
} 