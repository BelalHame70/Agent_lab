"use client";

import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import UseCases from "@/components/landing/UseCases";
import WhyAgentLab from "@/components/landing/WhyAgentLab";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import AgentDiagram from "@/components/landing/Agentdiagram";
export default function Landing() {
  return (
    <>
      <Nav />
      <Hero />
      <Features />
      <UseCases />
      <WhyAgentLab />
      <HowItWorks />
      <CTA />
      <Footer />
    </>
  );
}