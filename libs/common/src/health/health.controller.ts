import { HealthCheckResult } from '@nestjs/terminus';

export abstract class HealthController {
    abstract healthCheck(): Promise<HealthCheckResult>;
}
