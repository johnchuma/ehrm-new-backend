import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AssetService } from '../../../assets-service/src/assets/assets.service';
import { AssignmentService } from '../../../assets-service/src/assignments/assignments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assetService: AssetService,
    private readonly assignService: AssignmentService,
  ) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['companyId', 'name', 'category'],
      properties: {
        companyId: { type: 'string', example: 'comp-001' },
        name: { type: 'string', example: 'Dell Latitude 5540 Laptop' },
        description: { type: 'string', example: '15-inch laptop for finance department use' },
        serialNumber: { type: 'string', example: 'DL-5540-TZ-0012' },
        category: { type: 'string', example: 'it_equipment' },
        purchaseDate: { type: 'string', example: '2026-01-15' },
        purchaseValue: { type: 'number', example: 2500000 },
        location: { type: 'string', example: 'Dar es Salaam Office - Floor 3' },
        status: { type: 'string', enum: ['available', 'assigned', 'maintenance', 'retired'], example: 'available' },
      },
    },
  })
  create(@Body() body: any) { return this.assetService.create(body); }

  @Get()
  list(@Query() query: any) { return this.assetService.list(query.companyId, query); }

  @Get(':id')
  get(@Param('id') id: string) { return this.assetService.get(id); }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Dell Latitude 5540 Laptop' },
        description: { type: 'string', example: 'Updated: 15-inch laptop with docking station' },
        location: { type: 'string', example: 'Dar es Salaam Office - Floor 2' },
        status: { type: 'string', enum: ['available', 'assigned', 'maintenance', 'retired'], example: 'maintenance' },
        condition: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'], example: 'good' },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any) { return this.assetService.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.assetService.delete(id); }

  @Post('assign')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['assetId', 'employeeId', 'companyId'],
      properties: {
        assetId: { type: 'string', example: 'asset-001' },
        employeeId: { type: 'string', example: 'emp-003' },
        companyId: { type: 'string', example: 'comp-001' },
        assignedDate: { type: 'string', example: '2026-06-22' },
        expectedReturnDate: { type: 'string', example: '2026-12-31' },
        notes: { type: 'string', example: 'Assigned for project X - handle with care' },
      },
    },
  })
  assign(@Body() body: any) { return this.assignService.assign(body); }

  @Post('return/:id')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['condition', 'returnedBy'],
      properties: {
        condition: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'], example: 'good' },
        notes: { type: 'string', example: 'Laptop returned in good condition, minor scratch on lid' },
        returnedBy: { type: 'string', example: 'emp-003' },
      },
    },
  })
  return(@Param('id') id: string, @Body() body: any) { return this.assignService.returnAsset(id, body.returnDate, body.condition, body.notes); }

  @Get('assignments')
  listAssign(@Query() query: any) { return this.assignService.list(query.companyId, query.employeeId); }
}
