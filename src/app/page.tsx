import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
  LayoutDashboard,
  ArrowRight,
  Activity,
  CheckCircle2,
  XCircle
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Analista<span className="text-indigo-600">PRO</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="group flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Ir al Dashboard
              <LayoutDashboard className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-24 lg:py-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-transparent to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20" />
            <div className="absolute -top-24 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
          </div>

          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                  </span>
                  IA Avanzada para Apuestas Deportivas
                </div>

                <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl">
                  Predicciones con <br />
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Inteligencia Real
                  </span>
                </h1>

                <p className="mx-auto max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 lg:mx-0">
                  Gana ventaja competitiva con nuestro sistema de análisis deportivo basado en DeepSeek.
                  Analizamos estadísticas en tiempo real, alineaciones y lesiones para darte el mejor pick.
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <Link
                    href="/admin"
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 text-lg font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:bg-indigo-700 sm:w-auto"
                  >
                    Empezar Ahora
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <a
                    href="#features"
                    className="flex h-14 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-8 text-lg font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:w-auto"
                  >
                    Ver Características
                  </a>
                </div>
              </div>

              <div className="relative lg:block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                  {/* CSS Based Graphic Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="relative">
                      <div className="absolute -inset-8 animate-pulse rounded-full bg-indigo-500/20 blur-2xl" />
                      <div className="relative rounded-2xl bg-indigo-600 p-8 text-white shadow-2xl">
                        <BarChart3 className="h-16 w-16" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Micro-data */}
                  <div className="absolute top-12 left-12 h-20 w-48 rounded-2xl bg-white/80 p-4 shadow-lg backdrop-blur dark:bg-zinc-800/80">
                    <div className="mb-2 h-2 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-2 w-16 rounded bg-zinc-100 dark:bg-zinc-600" />
                  </div>

                  <div className="absolute bottom-12 right-12 h-24 w-40 rounded-2xl bg-indigo-50/80 p-4 shadow-lg backdrop-blur dark:bg-indigo-900/30">
                    <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                {/* Stats Card Floating */}
                <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-800 sm:block">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-green-100 p-2 dark:bg-green-900/30">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tasa de Acierto</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">82%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white px-6 py-24 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-base font-semibold uppercase tracking-wider text-indigo-600">Características</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">Todo lo que necesitas para ganar</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "IA de Última Generación",
                  description: "Utilizamos modelos de DeepSeek optimizados para el contexto deportivo y mercados de apuestas.",
                  icon: Zap,
                  color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                },
                {
                  title: "Datos en Tiempo Real",
                  description: "Conexión directa con API-Football para obtener alineaciones oficiales, bajas y estadísticas H2H.",
                  icon: BarChart3,
                  color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                },
                {
                  title: "Seguridad y Confianza",
                  description: "Nuestras predicciones se basan en datos objetivos, eliminando el sesgo emocional de las apuestas.",
                  icon: ShieldCheck,
                  color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                }
              ].map((feature, i) => (
                <div key={i} className="group rounded-3xl border border-zinc-100 bg-zinc-50 p-8 transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
                  <div className={`mb-6 inline-flex rounded-2xl p-3 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">{feature.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-6 py-24 bg-zinc-50 dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-base font-semibold uppercase tracking-wider text-indigo-600">Planes de Suscripción</h2>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Escala tu estrategia de análisis</p>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">Elige el plan que mejor se adapte a tu nivel de juego</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Free Plan */}
              <div className="flex flex-col rounded-3xl border border-zinc-200 bg-white p-8 shadow-lg transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Free</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-zinc-900 dark:text-white">$0</span>
                    <span className="text-sm font-medium text-zinc-500">/mes</span>
                  </div>
                  <p className="mt-4 text-sm text-zinc-500">Perfecto para empezar y conocer nuestra tecnología.</p>
                </div>
                <ul className="mb-8 space-y-4 flex-1">
                  {[
                    "Acceso a Ligas Básicas",
                    "Predicciones de Resultado",
                    "Estadísticas H2H",
                    "Actualización diaria"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-sm text-zinc-400 line-through">
                    <XCircle className="h-5 w-5 text-zinc-300" />
                    Ligas Elite (Champions, Premier)
                  </li>
                </ul>
                <Link
                  href="/auth"
                  className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 font-bold text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-800"
                >
                  Empezar Gratis
                </Link>
              </div>

              {/* Silver Plan */}
              <div className="relative flex flex-col rounded-3xl border-2 border-indigo-600 bg-white p-8 shadow-2xl transition-all hover:scale-[1.02] dark:bg-zinc-900">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/30">
                  Más Popular
                </div>
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Silver</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-zinc-900 dark:text-white">$19</span>
                    <span className="text-sm font-medium text-zinc-500">/mes</span>
                  </div>
                  <p className="mt-4 text-sm text-zinc-500">Análisis avanzado para ligas regionales y americanas.</p>
                </div>
                <ul className="mb-8 space-y-4 flex-1">
                  {[
                    "Todo lo del Plan FREE",
                    "Ligas Americanas (Liga MX, MLS)",
                    "Análisis de Goles Específico",
                    "Contexto Disciplinario (Cards)",
                    "Soporte Prioritario"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth"
                  className="flex h-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700"
                >
                  Suscribirse a Silver
                </Link>
              </div>

              {/* Gold Plan */}
              <div className="flex flex-col rounded-3xl border border-zinc-200 bg-zinc-900 p-8 shadow-lg transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-black">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white">Gold</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">$49</span>
                    <span className="text-sm font-medium text-zinc-400">/mes</span>
                  </div>
                  <p className="mt-4 text-sm text-zinc-400">Acceso total para analistas profesionales de elite.</p>
                </div>
                <ul className="mb-8 space-y-4 flex-1 text-zinc-300">
                  {[
                    "Todo lo del Plan SILVER",
                    "Ligas Elite (Champions, Premier)",
                    "Picks de Alta Confianza (>90%)",
                    "Modelo IA de Máxima Precisión",
                    "Alertas en Tiempo Real Web/Email"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-yellow-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth"
                  className="flex h-12 items-center justify-center rounded-xl bg-white font-bold text-zinc-900 transition-all hover:bg-zinc-100"
                >
                  Suscribirse a Gold
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-indigo-600 px-8 py-16 text-center text-white shadow-2xl shadow-indigo-500/40 lg:py-24">
            <h2 className="mb-6 text-4xl font-extrabold lg:text-5xl">¿Listo para transformar tus apuestas?</h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-indigo-100">
              Únete a los analistas que ya están usando Inteligencia Artificial para maximizar sus beneficios.
            </p>
            <Link
              href="/auth"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-10 text-lg font-bold text-indigo-600 transition-all hover:bg-zinc-50"
            >
              Comienza gratis hoy
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-12 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-white">AnalistaPRO</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} AnalistaPRO. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <a href="#" className="hover:text-indigo-600">Términos</a>
            <a href="#" className="hover:text-indigo-600">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
