import React from 'react';
import ParallaxWrapper from "@/components/ParallaxWrapper";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sobre from "@/components/Sobre";
import Beneficios from "@/components/Beneficios";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

function LinhaDelicada() {
  return (
    <div className="flex justify-center">
      <img src="/images/liner.png" alt="" className="h-0.5 w-full max-w-[400px] object-cover select-none pointer-events-none" draggable="false" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SEOHead 
        title="CERRADØ INTERBOX 2025 - O Maior Evento de Times da América Latina"
        description="24, 25 e 26 de outubro. O CERRADØ INTERBOX vai além da arena. Aqui você não se inscreve. Você assume seu chamado."
        image="/images/og-interbox.png"
        type="website"
      />
      <ParallaxWrapper>
        {/* Topo visual */}
        <LinhaDelicada />
        <Header />
        <Hero />
        <LinhaDelicada />
        <Sobre />
        <LinhaDelicada />
        <Beneficios />
        <LinhaDelicada />
        <CallToAction />
        <Footer />
      </ParallaxWrapper>
    </>
  );
} 