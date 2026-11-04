export const config = () => ({
  node_env: process.env.NODE_ENV,
  app_name: process.env.APP_NAME,
  version: process.env.VERSION,

  database: {
    master: {
      host: process.env.DB_MASTER_HOST,
      auth: {
        username: process.env.DB_MASTER_AUTH_USERNAME,
        password: process.env.DB_MASTER_AUTH_PASSWORD,
      },
      name: process.env.DB_MASTER_NAME,
      port: process.env.DB_MASTER_PORT,
    },
    replicas: [
      ...(process.env.DB_REPLICA1_HOST
        ? [
            {
              host: process.env.DB_REPLICA1_HOST,
              auth: {
                username: process.env.DB_REPLICA1_AUTH_USERNAME,
                password: process.env.DB_REPLICA1_AUTH_PASSWORD,
              },
              name: process.env.DB_REPLICA1_NAME,
              port: process.env.DB_REPLICA1_PORT,
            },
          ]
        : []),
      ...(process.env.DB_REPLICA2_HOST
        ? [
            {
              host: process.env.DB_REPLICA2_HOST,
              auth: {
                username: process.env.DB_REPLICA2_AUTH_USERNAME,
                password: process.env.DB_REPLICA2_AUTH_PASSWORD,
              },
              name: process.env.DB_REPLICA2_NAME,
              port: process.env.DB_REPLICA2_PORT,
            },
          ]
        : []),
    ],
  },

  redis: {
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },

  defaultAdmin: {
    name: process.env.DEFAULT_ORGANIZATION_ADMIN_USER_NAME,
    email: process.env.DEFAULT_ORGANIZATION_ADMIN_USER_EMAIL,
    password: process.env.DEFAULT_ORGANIZATION_ADMIN_USER_PASSWORD,
    phone: process.env.DEFAULT_ORGANIZATION_ADMIN_USER_TELEPHONE,
  },

  defaultOrganization: {
    name: process.env.DEFAULT_ORGANIZATION_NAME,
    email: process.env.DEFAULT_ORGANIZATION_EMAIL,
    phone: process.env.DEFAULT_ORGANIZATION_PHONE,
  },

  jwt: {
    secretKey: process.env.JWT_SECRET_KEY,
  },

  emailSmtp: {
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_SMTP_PORT,
    useTls: process.env.EMAIL_SMTP_USE_TLS,
    userName: process.env.EMAIL_SMTP_USERNAME,
    password: process.env.EMAIL_SMTP_PASSWORD,
    senderName: process.env.EMAIL_SMTP_SENDER_NAME,
    fromAddress: process.env.EMAIL_SMTP_FROM_ADDRESS,
  },

  frontendUrl: process.env.FRONTEND_URL,

  loanPaymentCallback: {
    token: process.env.LOAN_PAYMENT_CALLBACK_TOKEN,
  },
});
