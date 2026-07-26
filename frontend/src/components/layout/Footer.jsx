import React from 'react';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 border-t border-gray-200 text-xs text-gray-500 py-4 mt-auto px-4">
            <div className="mx-auto max-w-7xl grid grid-cols-3 items-center">
                <span className="justify-self-start font-semibold">V1.2</span>
                <p className="justify-self-center text-center">&copy; {currentYear} Caminos IPS. Todos los derechos reservados.</p>
                <img
                    src="/images/Logo vigilado Supersalud.png"
                    alt="Vigilado Supersalud"
                    className="justify-self-end h-8 w-auto"
                />
            </div>
        </footer>
    );
}

export default Footer;
