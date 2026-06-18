"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "@/hooks/useTranslation";

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from(".how-header", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".how-header",
          start: "top 85%",
        },
      });

      // Steps staggered reveal
      gsap.from(".step", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".steps",
          start: "top 80%",
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  // Get steps from translations with fallback defaults
  const steps = [
    {
      num: t("howItWorks", "steps.0.num") || "STEP 01",
      title: t("howItWorks", "steps.0.title") || "Create an account",
      body: t("howItWorks", "steps.0.body") || "Sign up for free and access your AgentLab dashboard in seconds.",
    },
    {
      num: t("howItWorks", "steps.1.num") || "STEP 02",
      title: t("howItWorks", "steps.1.title") || "Create an AI agent",
      body: t("howItWorks", "steps.1.body") || "Define your agent's purpose and configure its behavior and personality.",
    },
    {
      num: t("howItWorks", "steps.2.num") || "STEP 03",
      title: t("howItWorks", "steps.2.title") || "Upload your data",
      body: t("howItWorks", "steps.2.body") || "Train your agent with PDFs, TXT files, CSV and other documents.",
    },
    {
      num: t("howItWorks", "steps.3.num") || "STEP 04",
      title: t("howItWorks", "steps.3.title") || "Generate agent API",
      body: t("howItWorks", "steps.3.body") || "Get your unique API endpoint with authentication keys for integration.",
    },
    {
      num: t("howItWorks", "steps.4.num") || "STEP 05",
      title: t("howItWorks", "steps.4.title") || "Deploy anywhere",
      body: t("howItWorks", "steps.4.body") || "Integrate your AI agent into websites, apps, or any platform.",
    },
  ];

  return (
    <section className="how" id="how" ref={root}>
      <div className="container">
        <div className="how-header" style={{ textAlign: "center" }}>
          <h2 className="section-title">
            {t("howItWorks", "sectionTitle")}
          </h2>
          <p className="section-subtitle" style={{ margin: "16px auto 0" }}>
            {t("howItWorks", "sectionSubtitle")}
          </p>
        </div>

        <div className="steps">
          {steps.map((s, i) => (
            <div className="step" key={i}>
              <div className="step-num">{s.num}</div>
              <div className="step-content">
                <div className="step-title">{s.title}</div>
                <p className="step-body">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
