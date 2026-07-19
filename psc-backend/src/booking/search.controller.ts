import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ModuleAccess } from 'src/common/decorators/module-access.decorator';
import { MODULES } from 'src/common/constants/modules.constants';

@Controller('search')
@ModuleAccess(MODULES.SEARCH)
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get()
    async unifiedSearch(@Query('q') query: string) {
        return await this.searchService.unifiedSearch(query);
    }

    @Get('booking')
    async getUnifiedBooking(
        @Query('type') type: string,
        @Query('id') id: string
    ) {
        return await this.searchService.getUnifiedBooking(type, parseInt(id));
    }
}
