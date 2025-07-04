import { Reflector } from '@nestjs/core';
import { UserMicroService } from '@app/common';

export const Rbac = Reflector.createDecorator<UserMicroService.UserRole[]>();
