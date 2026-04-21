interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-slate-100">
      <section className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center shadow-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          SQL Interface
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
          Somos una plataforma educativa enfocada en ayudarte a aprender SQL de
          forma clara, practica e interactiva para fortalecer tus habilidades en
          bases de datos.
        </p>

        <button
          type="button"
          onClick={onEnter}
          className="mt-10 rounded-lg bg-emerald-500 px-8 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Ingresar
        </button>
      </section>
    </main>
  );
}
