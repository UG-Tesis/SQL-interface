import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EntryDialog } from '../components/EntryDialog';
import { FadeInUp } from '../components/FadeInUp';
import { PageBackdrop } from '../components/PageBackdrop';
import { SiteHeader } from '../components/SiteHeader';
import { useSession } from '../session/SessionContext';

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registeredUsers, registerUser, selectUser, clearAllBrowserData } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const state = location.state as { openEntry?: boolean } | null;
    if (state?.openEntry) {
      setDialogOpen(true);
      void navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const enterApp = () => {
    void navigate('/inicio');
  };

  const handleSelectUser = (personaId: number) => {
    const user = selectUser(personaId);
    if (user) {
      setDialogOpen(false);
      enterApp();
    }
  };

  const handleRegisterUser = async (input: {
    nombre: string;
    apellido: string;
    cedula: string;
    email?: string;
  }) => {
    await registerUser(input);
    setDialogOpen(false);
    enterApp();
  };

  return (
    <div className="relative flex min-h-screen flex-col dark:bg-slate-950">
      <PageBackdrop />
      <SiteHeader variant="landing" />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto w-full max-w-3xl text-center">
          <FadeInUp delayMs={80}>
            <h1 className="text-5xl font-extrabold tracking-tight text-cyan-600 dark:text-cyan-400 sm:text-6xl md:text-7xl">
              SQL
            </h1>
          </FadeInUp>
          <FadeInUp delayMs={180}>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
              Plataforma interactiva para aprender sentencias SQL de manera práctica, dinámica y sencilla
              para estudiantes universitarios.
            </p>
          </FadeInUp>
          <FadeInUp delayMs={280}>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="mt-10 inline-flex min-w-[10rem] items-center justify-center rounded-xl bg-cyan-600 px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-cyan-600/25 transition hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 active:translate-y-px"
            >
              Ingresar
            </button>
          </FadeInUp>
        </div>
      </main>

      <EntryDialog
        open={dialogOpen}
        users={registeredUsers}
        onClose={() => setDialogOpen(false)}
        onSelectUser={handleSelectUser}
        onRegisterUser={handleRegisterUser}
        onClearBrowserData={clearAllBrowserData}
      />
    </div>
  );
}
