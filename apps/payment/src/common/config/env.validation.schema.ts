import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string().required(),
    GRPC_URL: Joi.string().required(),
    MYSQL_URL: Joi.string().required(),
});
