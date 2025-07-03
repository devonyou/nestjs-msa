import { applyDecorators, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function ApiController(path: string): ClassDecorator {
    return applyDecorators(Controller(path), ApiTags(path));
}
