import React from 'react';
import ParallaxWrapper from "@/components/ParallaxWrapper";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sobre from "@/components/Sobre";
import Beneficios from "@/components/Beneficios";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

function LinhaDelicada() {
  return (
    <div className="flex justify-center">
      <img src="/images/liner.png" alt="" className="h-0.5 w-full max-w-[400px] object-cover select-none pointer-events-none" draggable="false" />
    </div>
  );
}

export default function Home() {
  return (
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
  );
} 