module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.example.com'),
        port: env('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        // ... any custom nodemailer options
      },
      settings: {
        defaultFrom: env('SMTP_FROM'),
        defaultReplyTo: env('SMTP_FROM'),
      },
    },
  },
  // ...
  // Otras configuraciones de plugins
  "users-permissions": {
    config: {
      register: {
        allowedFields: [
          "name",   // Permitir el campo 'name'
          "phone"   // Permitir el campo 'phone'
        ],
      },
    },
  },

   // S3
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('MINIO_PUBLIC_ENDPOINT'),
        s3Options: {
          credentials: {
            accessKeyId: env('MINIO_ROOT_USER'),
            secretAccessKey: env('MINIO_ROOT_PASSWORD'),
          },
          endpoint: env('MINIO_PRIVATE_ENDPOINT'),
          region: env('MINIO_REGION'),
          forcePathStyle: true,
          params: {
            Bucket: env('MINIO_BUCKET'),
          },
        }
      },
    },
  },

  // 👇 Plugin Redis (necesario para el provider)
  redis: {
    config: {
      connections: {
        default: {
          connection: {
            host: env('REDIS_HOST', '127.0.0.1'),
            port: env.int('REDIS_PORT', 6379),
            password: env('REDIS_PASSWORD', null),
            db: env.int('REDIS_DB', 0),
          },
        },
      },
    },
  },


// Redis
  'rest-cache': {
    enabled: true,
    config: {
      provider: {
        name: 'redis',
        options: {
          host: env('REDIS_HOST', '127.0.0.1'),
          port: env.int('REDIS_PORT', 6379),
          password: env('REDIS_PASSWORD', null),
          db: env.int('REDIS_DB', 0),
        },
      },
      strategy: {
        debug: true,           // Muestra logs de cache hits/misses
        maxAge: 3600,          // Tiempo de vida del cache (1 hora)
        allRoutes: true,       // ✅ Cachea todas las rutas GET automáticamente
        clearRelatedCache: true, // Invalida cuando cambian datos relacionados
      },
    },
  },



});