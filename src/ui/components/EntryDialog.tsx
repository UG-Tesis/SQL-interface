import { useEffect, useState, type FormEvent } from 'react';
import type { RegisteredUser } from '../../domain/models/RegisteredUser';
import { ApiError } from '../../infrastructure/api/apiClient';

type EntryMode = 'menu' | 'existing' | 'register';

interface EntryDialogProps {
  open: boolean;
  users: RegisteredUser[];
  onClose: () => void;
  onSelectUser: (personaId: number) => void;
  onRegisterUser: (input: {
    nombre: string;
    apellido: string;
    cedula: string;
    email?: string;
  }) => Promise<void>;
  onClearBrowserData: () => void;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  );
}

export function EntryDialog({
  open,
  users,
  onClose,
  onSelectUser,
  onRegisterUser,
  onClearBrowserData,
}: EntryDialogProps) {
  const [mode, setMode] = useState<EntryMode>('menu');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode('menu');
      setError(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    setMode('menu');
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onRegisterUser({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        cedula: cedula.trim(),
        email: email.trim() || undefined,
      });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 409 || err.status === 500)) {
        setError('Ya existe una persona con esa cédula o correo.');
      } else if (err instanceof ApiError) {
        setError('No se pudo registrar el usuario. Verifica que el backend esté activo.');
      } else {
        setError('Ocurrió un error al registrar. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearBrowserData = () => {
    const confirmed = window.confirm(
      '¿Eliminar todos los datos guardados en este navegador? Se borrarán usuarios, sesión activa, tema y preferencias de la interfaz.',
    );
    if (!confirmed) return;
    onClearBrowserData();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-dialog-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="entry-dialog-title" className="text-xl font-bold text-slate-900 dark:text-white">
              {mode === 'menu' && '¿Cómo deseas ingresar?'}
              {mode === 'existing' && 'Usuario registrado'}
              {mode === 'register' && 'Registrar nuevo usuario'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {mode === 'menu' && 'Elige una opción para continuar en la plataforma.'}
              {mode === 'existing' && 'Selecciona un perfil guardado en este navegador.'}
              {mode === 'register' && 'Completa tus datos para crear tu cuenta e inscribirte al curso.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {mode === 'menu' ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className="group flex flex-col items-start rounded-2xl border border-slate-200 p-5 text-left transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-700 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/30"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 transition group-hover:bg-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300">
                <UserIcon className="h-6 w-6" />
              </span>
              <span className="text-base font-semibold text-slate-900 dark:text-white">
                Usuario registrado
              </span>
              <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Ingresa con un perfil guardado en memoria del navegador.
              </span>
              {users.length > 0 ? (
                <span className="mt-3 text-xs font-medium text-cyan-700 dark:text-cyan-400">
                  {users.length} {users.length === 1 ? 'usuario disponible' : 'usuarios disponibles'}
                </span>
              ) : (
                <span className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-400">
                  Aún no hay usuarios guardados
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMode('register')}
              className="group flex flex-col items-start rounded-2xl border border-slate-200 p-5 text-left transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-700 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/30"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 transition group-hover:bg-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300">
                <UserPlusIcon className="h-6 w-6" />
              </span>
              <span className="text-base font-semibold text-slate-900 dark:text-white">
                Registrar usuario
              </span>
              <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Crea una nueva cuenta y guárdala para futuros ingresos.
              </span>
            </button>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
              <button
                type="button"
                onClick={handleClearBrowserData}
                className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                Limpiar todos los datos del navegador
              </button>
            </div>
          </>
        ) : null}

        {mode === 'existing' ? (
          <div>
            <button
              type="button"
              onClick={() => setMode('menu')}
              className="mb-4 text-sm font-medium text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              ← Volver a opciones
            </button>

            {users.length > 0 ? (
              <ul className="space-y-2">
                {users.map((user) => (
                  <li key={user.personaId}>
                    <button
                      type="button"
                      onClick={() => onSelectUser(user.personaId)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-slate-700 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/30"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.nombre} {user.apellido}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          ID {user.personaId} · {formatDate(user.fechaRegistro)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                        Entrar
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-600">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  No hay usuarios guardados en este navegador.
                </p>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
                >
                  Registrar nuevo usuario
                </button>
              </div>
            )}
          </div>
        ) : null}

        {mode === 'register' ? (
          <div>
            <button
              type="button"
              onClick={() => setMode('menu')}
              className="mb-4 text-sm font-medium text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              ← Volver a opciones
            </button>

            <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nombre
                  </span>
                  <input
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Apellido
                  </span>
                  <input
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cédula
                </span>
                <input
                  required
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Correo (opcional)
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-cyan-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </label>

              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Registrando...' : 'Registrar e ingresar'}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
