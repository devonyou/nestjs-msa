import { ExceptionFilter, Catch } from '@nestjs/common';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
    catch() {
        throw new GrpcInternalException('데이터베이스 query 오류가 발생했습니다.');
    }
}
