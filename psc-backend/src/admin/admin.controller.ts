import {
  Controller,
  Get,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ModuleAccess } from 'src/common/decorators/module-access.decorator';
import { MODULES } from 'src/common/constants/modules.constants';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ModuleAccess(MODULES.ADMINS)
  @Get('get/admins')
  async getAdmins() {
    return this.adminService.getAdmins();
  }
}
