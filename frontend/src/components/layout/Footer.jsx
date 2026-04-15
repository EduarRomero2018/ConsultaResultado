import React from 'react';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 border-t border-gray-200 text-center text-xs text-gray-500 py-4 mt-auto">
            <p>&copy; {currentYear} IPS Eduar Romero. Todos los derechos reservados.</p>
        </footer>
    );
}

export default Footer;
