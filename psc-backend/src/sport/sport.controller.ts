import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { CreateSportDto } from './dtos/sport.dto';
import { SportService } from './sport.service';
import { ModuleAccess } from 'src/common/decorators/module-access.decorator';
import { MODULES } from 'src/common/constants/modules.constants';

@Controller('sport')
export class SportController {
  constructor(private sport: SportService) { }

  // sports
  @ModuleAccess(MODULES.SPORTS)
  @Post('create/sport')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 5 }]))
  async createSport(
    @Body() payload: any,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Req() req: any,
  ) {
    // Parse sportCharge from JSON string if needed
    let sportCharge = payload.sportCharge;
    if (typeof sportCharge === 'string') {
      try {
        sportCharge = JSON.parse(sportCharge);
      } catch {
        sportCharge = [];
      }
    }

    // Parse timing from JSON string if needed
    let timing = payload.timing;
    if (typeof timing === 'string') {
      try {
        timing = JSON.parse(timing);
      } catch {
        timing = {};
      }
    }

    // Parse timingLadies from JSON string if needed
    let timingLadies = payload.timingLadies;
    if (typeof timingLadies === 'string') {
      try {
        timingLadies = JSON.parse(timingLadies);
      } catch {
        timingLadies = {};
      }
    }

    const sportPayload: CreateSportDto = {
      activity: payload.activity,
      description: payload.description,
      isActive: payload.isActive === 'true' || payload.isActive === true,
      timing,
      timingLadies,
      dressCodeDos: payload.dressCodeDos,
      dressCodeDonts: payload.dressCodeDonts,
      dos: payload.dos,
      donts: payload.donts,
      order: payload.order !== undefined ? Number(payload.order) : 0,
      sportCharge,
    };

    const adminName = req.user?.name || 'system';
    return this.sport.createSport(sportPayload, adminName, files?.files || []);
  }

  @ModuleAccess(MODULES.SPORTS)
  @Patch('update/sport')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 5 }]))
  async updateSport(
    @Query('id') id: string,
    @Body() payload: any,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Req() req: any,
  ) {
    // Parse sportCharge from JSON string if needed
    let sportCharge = payload.sportCharge;
    if (typeof sportCharge === 'string') {
      try {
        sportCharge = JSON.parse(sportCharge);
      } catch {
        sportCharge = [];
      }
    }

    // Parse timing from JSON string if needed
    let timing = payload.timing;
    if (typeof timing === 'string') {
      try {
        timing = JSON.parse(timing);
      } catch {
        timing = {};
      }
    }

    // Parse timingLadies from JSON string if needed
    let timingLadies = payload.timingLadies;
    if (typeof timingLadies === 'string') {
      try {
        timingLadies = JSON.parse(timingLadies);
      } catch {
        timingLadies = {};
      }
    }

    // Handle existingimgs as array
    let existingimgs: string[] = [];
    if (payload.existingimgs) {
      if (Array.isArray(payload.existingimgs)) {
        existingimgs = payload.existingimgs;
      } else if (typeof payload.existingimgs === 'string') {
        try {
          existingimgs = JSON.parse(payload.existingimgs);
        } catch {
          existingimgs = [payload.existingimgs];
        }
      }
    }

    const sportPayload: Partial<CreateSportDto> = {
      activity: payload.activity,
      description: payload.description,
      isActive: payload.isActive === 'true' || payload.isActive === true,
      timing,
      timingLadies,
      dressCodeDos: payload.dressCodeDos,
      dressCodeDonts: payload.dressCodeDonts,
      dos: payload.dos,
      donts: payload.donts,
      existingimgs,
      order: payload.order !== undefined ? Number(payload.order) : undefined,
      sportCharge,
    };

    const adminName = req.user?.name || 'system';
    return this.sport.updateSport(
      Number(id),
      sportPayload,
      adminName,
      files?.files || [],
    );
  }

  @UseGuards(JwtAccGuard)
  @Get('get/sports')
  async getSports() {
    return this.sport.getSports();
  }

  @ModuleAccess(MODULES.SPORTS)
  @Delete('delete/sport')
  async deleteSport(@Query('id') id: string) {
    return this.sport.deleteSport(Number(id));
  }
}
