import React from 'react';
import ParallaxWrapper from "@/components/ParallaxWrapper";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sobre from "@/components/Sobre";
import TempoReal from "@/components/TempoReal";
import Beneficios from "@/components/Beneficios";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Image from "next/image";

function LinhaDelicada() {
  return (
    <div className="flex justify-center">
              <Image src="/images/liner.png" alt="" className="h-0.5 w-full max-w-[400px] object-cover select-none pointer-events-none" draggable="false" width={400} height={1} style={{ width: 'auto', height: 'auto' }} />
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
        keywords="CERRADØ INTERBOX, competição de times, crossfit competition, fitness event, Brasil, América Latina, 2025"
        tags={["crossfit", "competição", "times", "fitness", "evento", "Brasil"]}
        canonical="https://cerradointerbox.com.br"
      />
      <ParallaxWrapper>
        {/* Topo visual */}
        <LinhaDelicada />
        <Header />
        <Hero />
        <LinhaDelicada />
        <Sobre />
        <LinhaDelicada />
        <TempoReal />
        <LinhaDelicada />
        <Beneficios />
        <LinhaDelicada />
        <CallToAction />
        <Footer />
      </ParallaxWrapper>
    </>
  );
} 