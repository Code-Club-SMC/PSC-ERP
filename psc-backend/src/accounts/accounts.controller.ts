import {
    Controller,
    Post,
    Get,
    UseInterceptors,
    UploadedFile,
    Body,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccountsService } from './accounts.service';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { ModuleAccess } from 'src/common/decorators/module-access.decorator';
import { MODULES } from 'src/common/constants/modules.constants';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) { }

    @ModuleAccess(MODULES.ACCOUNTS)
    @Post('upload-bills')
    @UseInterceptors(FileInterceptor('file'))
    async uploadBills(
        @Body('month') month: string,
        @Body('year') year: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.accountsService.uploadBills(month, year, file);
    }

    @Get('bills')
    @UseGuards(JwtAccGuard)
    async getBills(
        @Req() req: { user: { id: string } },
        @Query('month') month?: string,
        @Query('year') year?: string,
    ) {
        return this.accountsService.getBills(req.user?.id, month, year);
    }

    @ModuleAccess(MODULES.ACCOUNTS)
    @Get('admin/bills')
    async getBillsAdmin(
        @Query('membershipNo') membershipNo: string,
        @Query('month') month?: string,
        @Query('year') year?: string,
    ) {
        return this.accountsService.getBills(membershipNo, month, year);
    }

    @Get('latest-bill')
    @UseGuards(JwtAccGuard)
    async getLatestBill(@Req() req: { user: { id: string } }) {
        return this.accountsService.getLatestBill(req.user?.id);
    }

    @ModuleAccess(MODULES.ACCOUNTS)
    @Get('admin/latest-bill')
    async getLatestBillAdmin(@Query('membershipNo') membershipNo: string) {
        return this.accountsService.getLatestBill(membershipNo);
    }

    @ModuleAccess(MODULES.ACCOUNTS)
    @Get('list-bills')
    async listBills(@Query('month') month: string, @Query('year') year: string) {
        return this.accountsService.listBills(month, year);
    }
}
