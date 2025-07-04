import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string().required(),
    HTTP_PORT: Joi.number().required(),
    GRPC_URL: Joi.string().required(),
    GOOGLE_CLIENT_ID: Joi.string().required(),
    GOOGLE_CLIENT_SECRET: Joi.string().required(),
    GOOGLE_AUTH_CALLBACK_URL: Joi.string().required(),
    JWT_ACCESS_SECRET_KEY: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_TIME: Joi.number().required(),
    JWT_REFRESH_SECRET_KEY: Joi.string().required(),
    JWT_REFRESH_EXPIRATION_TIME: Joi.number().required(),
    MYSQL_URL: Joi.string().required(),
    REDIS_URL: Joi.string().required(),
});
