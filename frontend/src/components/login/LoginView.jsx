import React from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';

function LoginView({
    email,
    password,
    loading,
    onEmailChange,
    onPasswordChange,
    onSubmit,
}) {
    // Retorna el formulario de inicio de sesión con inputs de correo y contraseña,
    // botón de envío y una imagen decorativa lateral.
    return (
        <main className="flex flex-col items-center justify-start px-4 py-8">
            <div className="flex max-w-6xl min-h-[64vh] overflow-hidden rounded-3xl shadow-2xl bg-white/0">
                <section className="flex min-h-full w-full items-center justify-center bg-institucion-primary p-6 md:w-[48%] md:p-8 lg:p-10 relative">
                    <div className="w-full max-w-lg rounded-2xl bg-white/10 backdrop-blur-md p-8 shadow-xl md:p-12">
                        <div className="mb-10">
                            <h2 className="mb-2 text-3xl font-bold text-white font-sans">
                                Acceso Administrativo
                            </h2>
                            <p className="text-white/80 font-sans">
                                Ingrese sus credenciales para cargar resultados.
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white font-sans">
                                    Correo electrónico
                                </label>
                                <div className="relative group">
                                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-lg" />
                                    <input
                                        type="email"
                                        className="w-full rounded-lg border border-white/20 bg-white/10 px-10 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/50 focus:bg-white/20 focus:ring-2 focus:ring-[#4b3fa7]"
                                        placeholder="admin@ejemplo.com"
                                        value={email}
                                        onChange={onEmailChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white font-sans">
                                    Contraseña
                                </label>
                                <div className="relative group">
                                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-lg" />
                                    <input
                                        type="password"
                                        className="w-full rounded-lg border border-white/20 bg-white/10 px-10 py-3 text-white outline-none transition-all duration-300 placeholder:text-white/50 focus:bg-white/20 focus:ring-2 focus:ring-[#4b3fa7]"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={onPasswordChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full rounded-lg bg-white text-[#2d2651] py-4 text-base font-bold uppercase tracking-widest shadow-lg transition-all hover:bg-gray-100 active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Validando...' : 'Iniciar Sesión'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                <section className="hidden md:flex w-[52%] bg-white relative flex-col items-center justify-center text-[#2d2651] min-h-full overflow-hidden">
                    <div className="relative z-10 px-10">
                        <img
                            src="/images/Cargue.png"
                            alt="Cargue de archivos"
                            className="h-auto max-w-full object-contain"
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}

export default LoginView;
