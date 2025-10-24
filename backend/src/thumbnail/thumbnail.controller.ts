import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ThumbnailService } from './thumbnail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Thumbnail')
@Controller('thumbnail')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ThumbnailController {
  constructor(private thumbnailService: ThumbnailService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze thumbnail image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async analyzeThumbnail(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.thumbnailService.analyzeThumbnail(file, req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get thumbnail analysis history' })
  async getHistory(@Request() req) {
    return this.thumbnailService.getThumbnailHistory(req.user.id);
  }
}
