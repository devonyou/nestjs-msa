import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    HTTP_HOST: Joi.string().required(),
    HTTP_PORT: Joi.number().required(),
    CORS_ORIGIN: Joi.string().required(),
    USER_HTTP_URL: Joi.string().required(),
    USER_GRPC_URL: Joi.string().required(),
    PRODUCT_GRPC_URL: Joi.string().required(),
    ORDER_GRPC_URL: Joi.string().required(),
    PAYMENT_GRPC_URL: Joi.string().required(),
    NOTIFICATION_GRPC_URL: Joi.string().required(),
    SWAGGER_PATH: Joi.string().required(),
    SWAGGER_TITLE: Joi.string().required(),
    SWAGGER_DESCRIPTION: Joi.string().required(),
    SWAGGER_VERSION: Joi.string().required(),
});
