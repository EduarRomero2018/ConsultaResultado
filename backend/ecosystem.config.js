// Configuración de PM2 para producción.
// Uso inicial (una sola vez, en el servidor): pm2 start ecosystem.config.js && pm2 save
// Despliegues posteriores (vía CI/CD): pm2 restart consulta-resultado-api
export default {
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
