import { HealthMicroService } from '@app/common';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController {
    @GrpcMethod(HealthMicroService.HEALTH_SERVICE_NAME, 'check')
    check(): HealthMicroService.HealthCheckResponse {
        return { status: HealthMicroService.HealthCheckResponse_ServingStatus.SERVING };
    }
}
