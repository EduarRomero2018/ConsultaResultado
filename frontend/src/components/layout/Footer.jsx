import React from 'react';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 border-t border-gray-200 text-xs text-gray-500 py-4 mt-auto px-4">
            <div className="mx-auto max-w-7xl grid grid-cols-3 items-center">
                <span className="justify-self-start font-semibold">V1.1</span>
                <p className="justify-self-center text-center">&copy; {currentYear} Caminos IPS. Todos los derechos reservados.</p>
                <span className="justify-self-end" aria-hidden="true"></span>
            </div>
        </footer>
    );
}

export default Footer;
