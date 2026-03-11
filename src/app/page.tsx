"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  ArrowRight,
  Activity,
  CheckCircle2,
  XCircle,
  Gem,
  Sun,
  Flame,
  Globe2
} from "lucide-react";

export default function Home() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" }, [
    Autoplay({ delay: 3500, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="flex min-h-screen flex-col bg-[#111312] font-sans selection:bg-emerald-600/30">
      {/* Background Maya Patterns */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft geometric jade gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-700/10 blur-[100px] rounded-full mix-blend-screen" />

        {/* Subtle geometric grid / dots conveying "ancient tech" */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#111312]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 group cursor-pointer z-10">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-800 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
              <Sun className="h-4 w-4 text-[#111312] absolute" />
              <div className="absolute inset-1 border border-[#111312]/20 rounded rotate-45" />
            </div>
            <span className="text-lg font-bold tracking-widest text-zinc-100 uppercase">
              Analista<span className="text-emerald-500 font-light">PRO</span>
            </span>
          </div>
          <div className="flex items-center gap-4 z-10">
            <Link
              href="/admin"
              className="group flex items-center gap-2 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-1.5 text-xs font-bold tracking-widest text-emerald-100 transition-all hover:bg-emerald-900/50 hover:border-emerald-500/50 uppercase"
            >
              Portal
              <LayoutDashboard className="h-3 w-3 transition-transform group-hover:scale-110 text-emerald-400" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-24 relative z-10">
        {/* Hero Section */}
        <section className="relative px-6 py-12 lg:py-20 flex flex-col items-center justify-center min-h-[75vh]">
          <div className="mx-auto max-w-5xl text-center space-y-6">

            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-900/50 bg-emerald-950/20 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 backdrop-blur-sm animate-fade-in">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              Sabiduría Analítica Milenaria
            </div>

            <h1 className="text-5xl font-black tracking-tighter text-white sm:text-7xl lg:text-8xl drop-shadow-2xl">
              El Oráculo del<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-amber-200">
                Deporte Moderno
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 font-medium">
              Descifra el resultado de las batallas en la cancha. Algoritmos de inteligencia profunda que analizan el juego como los antiguos estudiaban los astros.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
              <Link
                href="/auth"
                className="group relative flex h-12 w-full max-w-[200px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative z-10 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-200" />
                  Despertar IA
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Carousel Section */}
        <section className="py-12 border-y border-white/5 bg-black/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#111312] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#111312] to-transparent z-10 pointer-events-none" />

          <div className="max-w-[100vw] mx-auto px-4 z-0">
            <h2 className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">Nuestros Pilares de Visión</h2>

            <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
              <div className="flex gap-6 -ml-4 py-4">
                {[
                  {
                    icon: Zap,
                    title: "Velocidad Divina",
                    desc: "Sincronización instantánea de alineaciones y bajas oficiales.",
                    color: "text-amber-400",
                    border: "border-amber-900/30"
                  },
                  {
                    icon: ShieldCheck,
                    title: "Certeza Absoluta",
                    desc: "Rendimientos calculados libres de emoción humana o sesgos.",
                    color: "text-emerald-400",
                    border: "border-emerald-900/30"
                  },
                  {
                    icon: Globe2,
                    title: "Dominio Global",
                    desc: "Análisis de las mejores ligas de todos los continentes.",
                    color: "text-blue-400",
                    border: "border-blue-900/30"
                  },
                  {
                    icon: Activity,
                    title: "Pulsaciones en Vivo",
                    desc: "Seguimiento y re-evaluación en directo durante el encuentro.",
                    color: "text-rose-400",
                    border: "border-rose-900/30"
                  },
                  {
                    icon: Gem,
                    title: "Picks de Oro",
                    desc: "Detección de valor matemático (+EV) en las líneas de cuotas.",
                    color: "text-yellow-400",
                    border: "border-yellow-900/30"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex-[0_0_85%] sm:flex-[0_0_40%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0 pl-4">
                    <div className={`group relative h-full flex flex-col rounded-2xl border ${item.border} bg-[#1a1c1b] p-6 transition-all hover:-translate-y-1 hover:bg-[#1a1c1b]/80`}>
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <item.icon className="w-24 h-24" />
                      </div>
                      <item.icon className={`h-6 w-6 mb-4 ${item.color}`} />
                      <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">{item.title}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium mt-auto relative z-10">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-4 relative z-20">
              <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 text-zinc-400" onClick={scrollPrev}>
                <ArrowRight className="w-3 h-3 rotate-180" />
              </button>
              <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 text-zinc-400" onClick={scrollNext}>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Section Minimal */}
        <section id="pricing" className="px-6 py-20 relative">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Tributos y Acceso</h2>
              <p className="mt-2 text-2xl font-bold tracking-tight text-white uppercase">Ofrendas al Oráculo</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 items-center">
              {/* Free Plan */}
              <div className="rounded-2xl border border-white/5 bg-[#1a1c1b] p-6 transition-all hover:bg-[#1f2120]">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Iniciado (Free)</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-white">$0</span>
                </div>
                <ul className="mb-6 space-y-3">
                  {["Ligas Básicas", "Predicciones simples", "1 actualización diaria"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-1 h-1 rounded-full bg-zinc-600" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center rounded-lg border border-white/10 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5 uppercase tracking-widest">
                  Explorar
                </Link>
              </div>

              {/* Silver Plan */}
              <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#1a1c1b] to-emerald-950/20 p-8 shadow-[0_0_30px_rgba(16,185,129,0.1)] md:-translate-y-4">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  El Camino Medio
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4">Guerrero (Silver)</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">$19</span><span className="text-xs text-zinc-500">/mes</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {["Análisis de Ligas Americanas", "Predicción de Goles y Cards", "Soporte Prioritario"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center rounded-lg bg-emerald-600 py-3 text-xs font-black text-black hover:bg-emerald-500 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  Evolucionar
                </Link>
              </div>

              {/* Gold Plan */}
              <div className="rounded-2xl border border-amber-900/30 bg-[#1a1c1b] p-6 transition-all hover:bg-[#1f2120]">
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-4">Sacerdote (Gold)</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-white">$49</span><span className="text-xs text-zinc-500">/mes</span>
                </div>
                <ul className="mb-6 space-y-3">
                  {["Ligas Elite Europeas", "Picks de Máxima Confianza", "Alertas en vivo (Push)"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-1 h-1 rounded-full bg-amber-600" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center rounded-lg border border-amber-900/50 py-2 text-xs font-bold text-amber-500 hover:bg-amber-900/20 hover:text-amber-400 uppercase tracking-widest">
                  Ascender
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-white/5 bg-[#0a0a0a] px-6 py-8">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Sun className="h-3 w-3 text-emerald-500" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">AnalistaPRO</span>
          </div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            © {new Date().getFullYear()} Sabiduría IA. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
