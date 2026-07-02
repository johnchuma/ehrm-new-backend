import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssetsService } from './assets.service';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  // ─────────────── Asset register ───────────────

  @Get()
  @ApiOperation({ summary: 'List assets for the company' })
  list(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('condition') condition?: string,
    @Query('search') search?: string,
  ) {
    return this.assets.listAssets({ companyId, category, status, condition, search });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Asset KPI counts and totals' })
  stats(@Query('companyId') companyId: string) {
    return this.assets.stats(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one asset with allocations and maintenance' })
  get(@Param('id') id: string) {
    return this.assets.getAsset(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an asset' })
  create(@Body() body: any) {
    return this.assets.createAsset(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an asset' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.assets.updateAsset(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an asset' })
  remove(@Param('id') id: string) {
    return this.assets.deleteAsset(id);
  }

  // ─────────────── Allocations ───────────────

  @Get('allocations/list')
  @ApiOperation({ summary: 'List asset allocations' })
  listAllocations(
    @Query('companyId') companyId: string,
    @Query('assetId') assetId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.assets.listAllocations(companyId, assetId, employeeId, activeOnly === 'true');
  }

  @Post('allocations')
  @ApiOperation({ summary: 'Allocate an asset to an employee' })
  createAllocation(@Body() body: any) {
    return this.assets.createAllocation(body);
  }

  @Post('allocations/:id/return')
  @ApiOperation({ summary: 'Mark an allocation as returned' })
  returnAllocation(@Param('id') id: string, @Body() body: { returnedAt?: string; notes?: string }) {
    return this.assets.returnAllocation(id, body);
  }

  // ─────────────── Maintenance ───────────────

  @Get('maintenance/list')
  @ApiOperation({ summary: 'List maintenance logs' })
  listMaintenance(
    @Query('companyId') companyId: string,
    @Query('assetId') assetId?: string,
    @Query('status') status?: string,
  ) {
    return this.assets.listMaintenance(companyId, assetId, status);
  }

  @Post('maintenance')
  @ApiOperation({ summary: 'Schedule a maintenance entry' })
  createMaintenance(@Body() body: any) {
    return this.assets.createMaintenance(body);
  }

  @Patch('maintenance/:id')
  @ApiOperation({ summary: 'Update a maintenance log (e.g. mark complete)' })
  updateMaintenance(@Param('id') id: string, @Body() body: any) {
    return this.assets.updateMaintenance(id, body);
  }

  // ─────────────── Procurement ───────────────

  @Get('procurement/list')
  @ApiOperation({ summary: 'List procurement requests' })
  listProcurements(@Query('companyId') companyId: string, @Query('status') status?: string) {
    return this.assets.listProcurements(companyId, status);
  }

  @Post('procurement')
  @ApiOperation({ summary: 'Raise a procurement request' })
  createProcurement(@Body() body: any) {
    return this.assets.createProcurement(body);
  }

  @Patch('procurement/:id')
  @ApiOperation({ summary: 'Approve / reject / update a procurement request' })
  updateProcurement(@Param('id') id: string, @Body() body: any) {
    return this.assets.updateProcurement(id, body);
  }
}
