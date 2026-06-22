import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class GeofenceService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async create(data: any) {
    const gf = await this.prisma.geofence.create({ data });
    return this.toResponse(gf);
  }

  async update(id: string, data: any) {
    const gf = await this.prisma.geofence.update({ where: { id }, data });
    return this.toResponse(gf);
  }

  async list(companyId: string) {
    const gfs = await this.prisma.geofence.findMany({ where: { companyId } });
    return { geofences: gfs.map((g) => this.toResponse(g)) };
  }

  private toResponse(g: any) {
    return {
      id: g.id, companyId: g.companyId, name: g.name, type: g.type,
      lat: g.lat, lng: g.lng, radius: g.radius,
      branchIds: g.branchIds ? g.branchIds.split(',') : [],
      status: g.status,
    };
  }
}
