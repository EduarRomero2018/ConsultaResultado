// Configuración de PM2 para producción.
// .cjs a propósito: backend/package.json tiene "type": "module", y PM2 no
// resuelve de forma confiable un ecosystem.config.js con "export default" ESM.
// Uso inicial (una sola vez, en el servidor): pm2 start ecosystem.config.cjs && pm2 save
// Despliegues posteriores (vía CI/CD): pm2 restart consulta-resultado-api
module.exports = {
    apps: [
        {
            name: 'consulta-resultado-api',
            script: './server.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
