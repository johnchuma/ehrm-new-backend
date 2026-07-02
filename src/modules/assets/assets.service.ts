import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';

function toDateOnlyStr(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

function toNum(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  // ─────────────── Asset helpers ───────────────

  private assetInclude() {
    return {
      assignedTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          email: true,
          employeeNumber: true,
          department: { select: { id: true, name: true } },
        },
      },
      branch: { select: { id: true, name: true, code: true } },
    } as const;
  }

  private serializeAsset(a: any) {
    return {
      ...a,
      purchasePrice: a.purchasePrice !== null && a.purchasePrice !== undefined ? Number(a.purchasePrice) : null,
      currentValue: a.currentValue !== null && a.currentValue !== undefined ? Number(a.currentValue) : null,
    };
  }

  private async nextAssetTag(companyId: string): Promise<string> {
    const count = await this.prisma.asset.count({
      where: { companyId, deletedAt: null },
    });
    return `AST-${String(count + 1).padStart(3, '0')}`;
  }

  // ─────────────── Asset CRUD ───────────────

  async listAssets(filters: { companyId?: string; category?: string; status?: string; condition?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.category && filters.category !== 'All') where.category = filters.category;
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.condition && filters.condition !== 'All') where.condition = filters.condition;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { assetTag: { contains: filters.search } },
        { serialNumber: { contains: filters.search } },
        { make: { contains: filters.search } },
        { model: { contains: filters.search } },
        { assignedTo: { fullName: { contains: filters.search } } },
      ];
    }
    const rows = await this.prisma.asset.findMany({
      where,
      include: this.assetInclude(),
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.serializeAsset(r));
  }

  async getAsset(id: string) {
    const a = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        ...this.assetInclude(),
        allocations: {
          include: { employee: { select: { id: true, firstName: true, lastName: true, fullName: true, email: true } } },
          orderBy: { allocatedAt: 'desc' },
        },
        maintenance: { orderBy: { date: 'desc' } },
      },
    });
    if (!a) throw new NotFoundException('Asset not found');
    return this.serializeAsset(a);
  }

  async createAsset(body: any) {
    if (!body.companyId) throw new BadRequestException('companyId required');
    if (!body.name) throw new BadRequestException('name required');
    const tag = body.assetTag || (await this.nextAssetTag(body.companyId));
    const data: any = {
      companyId: body.companyId,
      assetTag: tag,
      name: body.name,
      category: body.category || 'IT Equipment',
      make: body.make || null,
      model: body.model || null,
      serialNumber: body.serialNumber || null,
      purchaseDate: toDateOnlyStr(body.purchaseDate),
      purchasePrice: toNum(body.purchasePrice),
      currentValue: toNum(body.currentValue ?? body.purchasePrice),
      currency: body.currency || 'TZS',
      location: body.location || null,
      branchId: body.branchId || null,
      condition: body.condition || 'Good',
      status: body.status || 'Available',
      assignedToId: body.assignedToId || null,
      warrantyExpiry: toDateOnlyStr(body.warrantyExpiry),
      nextMaintenance: toDateOnlyStr(body.nextMaintenance),
      notes: body.notes || null,
      createdById: body.createdById || null,
    };
    const created = await this.prisma.asset.create({ data, include: this.assetInclude() });
    return this.serializeAsset(created);
  }

  async updateAsset(id: string, body: any) {
    const existing = await this.prisma.asset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asset not found');
    const data: any = {};
    const passthrough = ['name', 'category', 'make', 'model', 'serialNumber', 'location', 'branchId', 'condition', 'status', 'assignedToId', 'notes', 'currency'];
    for (const k of passthrough) if (body[k] !== undefined) data[k] = body[k];
    if (body.purchaseDate !== undefined) data.purchaseDate = toDateOnlyStr(body.purchaseDate);
    if (body.warrantyExpiry !== undefined) data.warrantyExpiry = toDateOnlyStr(body.warrantyExpiry);
    if (body.nextMaintenance !== undefined) data.nextMaintenance = toDateOnlyStr(body.nextMaintenance);
    if (body.purchasePrice !== undefined) data.purchasePrice = toNum(body.purchasePrice);
    if (body.currentValue !== undefined) data.currentValue = toNum(body.currentValue);
    const updated = await this.prisma.asset.update({ where: { id }, data, include: this.assetInclude() });
    return this.serializeAsset(updated);
  }

  async deleteAsset(id: string) {
    const existing = await this.prisma.asset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asset not found');
    return this.prisma.asset.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async stats(companyId: string) {
    const rows = await this.prisma.asset.findMany({
      where: { companyId, deletedAt: null },
      select: { id: true, status: true, condition: true, currentValue: true, category: true, purchasePrice: true },
    });
    const total = rows.length;
    const active = rows.filter((r) => r.status === 'Active').length;
    const available = rows.filter((r) => r.status === 'Available').length;
    const underMaintenance = rows.filter((r) => r.status === 'Under Maintenance').length;
    const disposed = rows.filter((r) => r.status === 'Disposed').length;
    const totalValue = rows.reduce((s, r) => s + (r.currentValue ? Number(r.currentValue) : 0), 0);
    const totalCost = rows.reduce((s, r) => s + (r.purchasePrice ? Number(r.purchasePrice) : 0), 0);
    const byCategory = rows.reduce<Record<string, { count: number; value: number }>>((acc, r) => {
      const c = r.category || 'Uncategorised';
      if (!acc[c]) acc[c] = { count: 0, value: 0 };
      acc[c].count += 1;
      acc[c].value += r.currentValue ? Number(r.currentValue) : 0;
      return acc;
    }, {});
    return { total, active, available, underMaintenance, disposed, totalValue, totalCost, byCategory };
  }

  // ─────────────── Allocations ───────────────

  async listAllocations(companyId: string, assetId?: string, employeeId?: string, activeOnly = false) {
    const where: any = { companyId };
    if (assetId) where.assetId = assetId;
    if (employeeId) where.employeeId = employeeId;
    if (activeOnly) where.returnedAt = null;
    return this.prisma.assetAllocation.findMany({
      where,
      include: {
        asset: { select: { id: true, name: true, assetTag: true, category: true, location: true } },
        employee: { select: { id: true, firstName: true, lastName: true, fullName: true, email: true, employeeNumber: true } },
      },
      orderBy: { allocatedAt: 'desc' },
    });
  }

  async createAllocation(body: any) {
    if (!body.companyId) throw new BadRequestException('companyId required');
    if (!body.assetId) throw new BadRequestException('assetId required');
    if (!body.employeeId) throw new BadRequestException('employeeId required');
    if (!body.allocatedAt) throw new BadRequestException('allocatedAt required');

    const asset = await this.prisma.asset.findUnique({ where: { id: body.assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    // close any prior open allocation for this asset
    await this.prisma.assetAllocation.updateMany({
      where: { assetId: body.assetId, returnedAt: null },
      data: { returnedAt: toDateOnlyStr(new Date()) },
    });

    const data: any = {
      companyId: body.companyId,
      assetId: body.assetId,
      employeeId: body.employeeId,
      allocatedAt: toDateOnlyStr(body.allocatedAt),
      expectedReturnDate: toDateOnlyStr(body.expectedReturnDate),
      returnedAt: null,
      notes: body.notes || null,
      createdById: body.createdById || null,
    };
    const created = await this.prisma.assetAllocation.create({
      data,
      include: {
        asset: { select: { id: true, name: true, assetTag: true, category: true } },
        employee: { select: { id: true, firstName: true, lastName: true, fullName: true, email: true } },
      },
    });

    // sync the asset's current holder
    await this.prisma.asset.update({
      where: { id: body.assetId },
      data: { assignedToId: body.employeeId, status: 'Active' },
    });

    return created;
  }

  async returnAllocation(id: string, body: { returnedAt?: string; notes?: string }) {
    const existing = await this.prisma.assetAllocation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Allocation not found');
    if (existing.returnedAt) return existing;
    const updated = await this.prisma.assetAllocation.update({
      where: { id },
      data: {
        returnedAt: toDateOnlyStr(body.returnedAt || new Date()),
        notes: body.notes || existing.notes,
      },
      include: {
        asset: { select: { id: true, name: true } },
        employee: { select: { id: true, fullName: true } },
      },
    });

    // Asset becomes available again if no other open allocations
    const stillAllocated = await this.prisma.assetAllocation.count({
      where: { assetId: existing.assetId, returnedAt: null, id: { not: id } },
    });
    if (stillAllocated === 0) {
      await this.prisma.asset.update({
        where: { id: existing.assetId },
        data: { status: 'Available', assignedToId: null },
      });
    }
    return updated;
  }

  // ─────────────── Maintenance ───────────────

  async listMaintenance(companyId: string, assetId?: string, status?: string) {
    const where: any = { companyId };
    if (assetId) where.assetId = assetId;
    if (status && status !== 'All') where.status = status;
    return this.prisma.assetMaintenance.findMany({
      where,
      include: { asset: { select: { id: true, name: true, assetTag: true, category: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async createMaintenance(body: any) {
    if (!body.companyId) throw new BadRequestException('companyId required');
    if (!body.assetId) throw new BadRequestException('assetId required');
    if (!body.type) throw new BadRequestException('type required');
    if (!body.date) throw new BadRequestException('date required');
    const data: any = {
      companyId: body.companyId,
      assetId: body.assetId,
      type: body.type,
      description: body.description || '',
      date: toDateOnlyStr(body.date),
      cost: toNum(body.cost),
      currency: body.currency || 'TZS',
      technician: body.technician || null,
      status: body.status || 'Scheduled',
      nextDue: toDateOnlyStr(body.nextDue),
      createdById: body.createdById || null,
    };
    const created = await this.prisma.assetMaintenance.create({
      data,
      include: { asset: { select: { id: true, name: true, assetTag: true } } },
    });
    // While maintenance is open, flip asset status
    if (data.status === 'In Progress' || data.status === 'Scheduled') {
      await this.prisma.asset.update({ where: { id: body.assetId }, data: { status: 'Under Maintenance' } }).catch(() => {});
    }
    return created;
  }

  async updateMaintenance(id: string, body: any) {
    const existing = await this.prisma.assetMaintenance.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Maintenance log not found');
    const data: any = {};
    const passthrough = ['type', 'description', 'technician', 'status'];
    for (const k of passthrough) if (body[k] !== undefined) data[k] = body[k];
    if (body.date !== undefined) data.date = toDateOnlyStr(body.date);
    if (body.nextDue !== undefined) data.nextDue = toDateOnlyStr(body.nextDue);
    if (body.cost !== undefined) data.cost = toNum(body.cost);
    if (body.currency !== undefined) data.currency = body.currency;
    const updated = await this.prisma.assetMaintenance.update({
      where: { id },
      data,
      include: { asset: { select: { id: true, name: true, assetTag: true } } },
    });
    // If marked Completed, restore asset to Available
    if (data.status === 'Completed') {
      const stillOpen = await this.prisma.assetMaintenance.count({
        where: { assetId: existing.assetId, status: { in: ['Scheduled', 'In Progress'] }, id: { not: id } },
      });
      if (stillOpen === 0) {
        await this.prisma.asset.update({ where: { id: existing.assetId }, data: { status: 'Available' } }).catch(() => {});
      }
    }
    return updated;
  }

  // ─────────────── Procurement ───────────────

  async listProcurements(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status && status !== 'All') where.status = status;
    return this.prisma.assetProcurement.findMany({
      where,
      orderBy: { requestDate: 'desc' },
    });
  }

  async createProcurement(body: any) {
    if (!body.companyId) throw new BadRequestException('companyId required');
    if (!body.item) throw new BadRequestException('item required');
    if (!body.estimatedCost) throw new BadRequestException('estimatedCost required');
    const data: any = {
      companyId: body.companyId,
      item: body.item,
      category: body.category || 'IT Equipment',
      quantity: body.quantity ? Number(body.quantity) : 1,
      estimatedCost: toNum(body.estimatedCost) || 0,
      currency: body.currency || 'TZS',
      requestedById: body.requestedById || null,
      requestedBy: body.requestedBy || null,
      department: body.department || null,
      justification: body.justification || null,
      status: body.status || 'Pending',
      requestDate: toDateOnlyStr(body.requestDate) || toDateOnlyStr(new Date()),
      createdById: body.createdById || null,
    };
    return this.prisma.assetProcurement.create({ data });
  }

  async updateProcurement(id: string, body: any) {
    const existing = await this.prisma.assetProcurement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Procurement request not found');
    const data: any = {};
    const passthrough = ['item', 'category', 'department', 'justification', 'status', 'requestedBy', 'currency'];
    for (const k of passthrough) if (body[k] !== undefined) data[k] = body[k];
    if (body.quantity !== undefined) data.quantity = Number(body.quantity);
    if (body.estimatedCost !== undefined) data.estimatedCost = toNum(body.estimatedCost) || 0;
    if (body.requestDate !== undefined) data.requestDate = toDateOnlyStr(body.requestDate);
    if (body.status === 'Approved' || body.status === 'Rejected') {
      data.approvedBy = body.approvedBy || null;
      data.approvedAt = new Date();
    }
    return this.prisma.assetProcurement.update({ where: { id }, data });
  }
}
