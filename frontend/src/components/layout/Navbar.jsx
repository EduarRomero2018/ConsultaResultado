import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    const location = useLocation();
    const token = sessionStorage.getItem('token');
    const handleLogout = () => {
        sessionStorage.removeItem('token');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="bg-institucion-primary text-white shadow-xl">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-3 gap-3 md:gap-0 md:relative">
                {/* Primera Fila en móvil / Izquierda en escritorio */}
                <div className="flex items-center justify-center w-full md:w-auto md:justify-start">
                    <img
                        src="/images/Caminos.png"
                        alt="Logo Caminos"
                        className="h-8 md:h-10 w-auto"
                    />
                    <span className="pl-[5px] font-semibold text-lg md:text-base">
                        Caminos IPS
                    </span>
                </div>

                {/* Segunda Fila en móvil / Centro en escritorio */}
                <h1 className="text-center text-lg md:text-lg lg:text-xl font-bold tracking-wide md:absolute md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 w-full md:w-auto">
                    Consulta de Resultados
                </h1>

                {/* Tercera Fila en móvil / Derecha en escritorio */}
                <nav className="flex items-center justify-center gap-2 md:gap-4 w-full md:w-auto md:ml-auto">
                    {token && (
                        <Link
                            to="/search"
                            className={`px-3 py-1 text-xs md:text-sm rounded transition-colors ${isActive('/search')
                                ? 'bg-white text-blue-700 font-semibold'
                                : 'hover:bg-indigo-600'
                                }`}
                        >
                            Buscar
                        </Link>
                    )}
                    {token && (
                        <Link
                            to="/upload"
                            className={`px-3 py-1 text-xs md:text-sm rounded transition-colors ${isActive('/upload')
                                ? 'bg-white text-blue-700 font-semibold'
                                : 'hover:bg-blue-600'
                                }`}
                        >
                            Subir
                        </Link>
                    )}
                    {token && (
                        <Link
                            to="/login"
                            className="px-3 py-1 text-xs md:text-sm rounded border border-white/70 text-white/90 hover:bg-white hover:text-[#2d2651] transition-colors"
                            onClick={handleLogout}
                        >
                            Cerrar sesión
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
