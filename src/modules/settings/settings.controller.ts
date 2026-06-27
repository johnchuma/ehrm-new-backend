import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';

function safeArray(value: any) {
  return Array.isArray(value) ? value : [];
}

function asDateOnly(value: any): Date | null {
  if (!value) return null;
  const normalized = String(value).slice(0, 10);
  const date = new Date(`${normalized}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateOnlyString(value: Date | string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function mergeRows(generalRows: any, dbRows: any[], key = 'name') {
  const general = safeArray(generalRows);
  const byId = new Map(general.filter((item) => item?.id).map((item) => [item.id, item]));
  const byKey = new Map(
    general
      .filter((item) => item?.[key])
      .map((item) => [String(item[key]).toLowerCase(), item]),
  );

  const merged = dbRows.map((row) => {
    const fromId = row.id ? byId.get(row.id) : null;
    const fromKey = row[key] ? byKey.get(String(row[key]).toLowerCase()) : null;
    return { ...(fromKey || fromId || {}), ...row };
  });

  const seen = new Set<string>();
  for (const item of merged) {
    if (item?.id) seen.add(String(item.id));
    if (item?.[key]) seen.add(String(item[key]).toLowerCase());
  }

  for (const row of general) {
    const rowId = row?.id ? String(row.id) : null;
    const rowKey = row?.[key] ? String(row[key]).toLowerCase() : '';
    const exists = (rowId && seen.has(rowId)) || (rowKey && seen.has(rowKey));
    if (!exists) {
      merged.push(row);
      if (rowId) seen.add(rowId);
      if (rowKey) seen.add(rowKey);
    }
  }

  return merged;
}

function parseJsonText(value: any, fallback: any) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toJsonText(value: any) {
  return JSON.stringify(value ?? null);
}

function toNumberOrNull(value: any) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('workspace/:companyId')
  @ApiOperation({ summary: 'Get complete workspace settings' })
  async getWorkspaceSettings(@Param('companyId') companyId: string) {
    const [
      companySettings,
      businessUnits,
      branches,
      departments,
      sections,
      contractTypes,
      grades,
      jobTitles,
      positions,
      benefits,
      holidays,
      salaryGrades,
      workingDays,
      locations,
      approvalConfigs,
    ] = await Promise.all([
      this.prisma.companySettings.findUnique({ where: { companyId } }),
      this.prisma.businessUnit.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.branch.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.department.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.section.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.contractType.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.grade.findMany({ where: { companyId, isActive: true }, orderBy: { rank: 'asc' } }),
      this.prisma.jobTitle.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.position.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.benefit.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.publicHoliday.findMany({ where: { companyId }, orderBy: { date: 'asc' } }),
      this.prisma.salaryGrade.findMany({ where: { companyId, isActive: true }, orderBy: [{ rank: 'asc' }, { name: 'asc' }] }),
      this.prisma.workingDayPattern.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.workspaceLocation.findMany({ where: { companyId, isActive: true }, orderBy: { name: 'asc' } }),
      this.prisma.workspaceApprovalConfig.findMany({ where: { companyId, isActive: true }, orderBy: { moduleKey: 'asc' } }),
    ]);

    let general: any = {};
    try {
      general = companySettings?.generalSettings ? JSON.parse(companySettings.generalSettings) : {};
    } catch {
      general = {};
    }

    const dbBusinessUnits = businessUnits.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      lead: row.lead || '',
      notes: row.notes || '',
      status: row.isActive ? 'Active' : 'Inactive',
    }));

    const dbBranches = branches.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      city: row.city || '',
      manager: row.managerId || '',
      status: row.isActive ? 'Active' : 'Inactive',
      address: row.address || '',
      country: row.country || '',
      phone: row.phone || '',
      email: row.email || '',
    }));

    const dbDepartments = departments.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      head: row.headId || '',
      status: row.isActive ? 'Active' : 'Inactive',
      description: row.description || '',
    }));

    const dbSections = sections.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code || '',
      status: row.isActive ? 'Active' : 'Inactive',
    }));

    const dbContractTypes = contractTypes.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code || '',
      status: row.isActive ? 'Active' : 'Inactive',
    }));

    const dbLevels = grades.map((row) => ({
      id: row.id,
      name: row.name,
      rank: row.rank,
      code: row.code || '',
      status: row.isActive ? 'Active' : 'Inactive',
    }));

    const dbJobTitles = jobTitles.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code || '',
      grade: row.grade || '',
      level: row.grade || '',
      description: row.description || '',
      status: row.isActive ? 'Active' : 'Inactive',
    }));

    const dbPositions = positions.map((row) => ({
      id: row.id,
      name: row.name,
      title: row.name,
      code: row.code || '',
      status: row.isActive ? 'Active' : 'Inactive',
    }));

    const dbBenefits = benefits.map((row) => ({
      id: row.id,
      name: row.name,
      desc: row.description || '',
      type: row.type || '',
      coverage: row.coverage || '',
      maxAmount: row.maxAmount ? Number(row.maxAmount) : null,
      status: row.isActive ? 'Active' : 'Inactive',
    }));

    const dbHolidays = holidays.map((row) => ({
      id: row.id,
      name: row.name,
      date: toDateOnlyString(row.date),
      type: row.isRecurring ? 'Recurring' : 'Public',
      isRecurring: row.isRecurring,
    }));

    const dbSalaryGrades = salaryGrades.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code || '',
      rank: row.rank,
      minSalary: row.minSalary ? Number(row.minSalary) : 0,
      maxSalary: row.maxSalary ? Number(row.maxSalary) : 0,
      currency: row.currency || 'TZS',
      status: row.isActive ? 'Active' : 'Inactive',
    }));

    const dbWorkingDays = workingDays.map((row) => ({
      id: row.id,
      name: row.name,
      pattern: row.pattern || '',
      hours: row.hours || '',
      weekend: row.weekend || '',
      weekendDays: parseJsonText(row.weekendDays, []),
      dayConfigs: parseJsonText(row.dayConfigs, {}),
      status: row.isActive ? 'Active' : 'Inactive',
    }));

    const dbLocations = locations.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code || '',
      city: row.city || '',
      country: row.country || '',
      type: row.type || '',
      address: row.address || '',
      radiusMeters: row.radiusMeters || 0,
      latitude: row.latitude ? Number(row.latitude) : '',
      longitude: row.longitude ? Number(row.longitude) : '',
      metadata: parseJsonText(row.metadata, null),
      status: row.isActive ? 'Active' : 'Inactive',
    }));

    const dbApprovalConfigs = approvalConfigs.map((row) => ({
      id: row.id,
      moduleKey: row.moduleKey,
      process: row.process || '',
      levels: row.levels,
      approvalMode: row.approvalMode || 'global',
      initiatorDepartments: parseJsonText(row.initiatorDepartments, []),
      initiators: parseJsonText(row.initiators, []),
      initiatorRule: row.initiatorRule || 'any',
      reviewerDepartments: parseJsonText(row.reviewerDepartments, []),
      reviewers: parseJsonText(row.reviewers, []),
      reviewerRule: row.reviewerRule || 'any',
      approverDepartments: parseJsonText(row.approverDepartments, []),
      approvers: parseJsonText(row.approvers, []),
      approverRule: row.approverRule || 'any',
      departmentAssignments: parseJsonText(row.departmentAssignments, []),
      escalation: row.escalation || '',
      status: row.isActive ? 'Active' : 'Inactive',
    }));

    return {
      ...general,
      businessUnits: mergeRows(general.businessUnits, dbBusinessUnits),
      branches: mergeRows(general.branches, dbBranches),
      departments: mergeRows(general.departments, dbDepartments),
      sections: mergeRows(general.sections, dbSections),
      contractTypes: mergeRows(general.contractTypes, dbContractTypes),
      levels: mergeRows(general.levels, dbLevels),
      jobTitles: mergeRows(general.jobTitles, dbJobTitles),
      positions: mergeRows(
        safeArray(general.positions).map((item) => ({
          ...item,
          name: item?.name || item?.title || '',
        })),
        dbPositions,
        'name',
      ),
      benefits: mergeRows(general.benefits, dbBenefits),
      holidays: mergeRows(general.holidays, dbHolidays),
      salaryGrades: mergeRows(general.salaryGrades, dbSalaryGrades),
      workingDays: mergeRows(general.workingDays, dbWorkingDays),
      locations: mergeRows(general.locations, dbLocations),
      approvalConfigs: mergeRows(general.approvalConfigs, dbApprovalConfigs, 'moduleKey'),
    };
  }

  @Put('workspace/:companyId')
  @ApiOperation({ summary: 'Save complete workspace settings' })
  async saveWorkspaceSettings(@Param('companyId') companyId: string, @Body() body: any) {
    const payload = body?.settings || body || {};

    const businessUnits = safeArray(payload.businessUnits);
    const branches = safeArray(payload.branches);
    const departments = safeArray(payload.departments);
    const sections = safeArray(payload.sections);
    const contractTypes = safeArray(payload.contractTypes);
    const levels = safeArray(payload.levels);
    const jobTitles = safeArray(payload.jobTitles);
    const positions = safeArray(payload.positions);
    const benefits = safeArray(payload.benefits);
    const holidays = safeArray(payload.holidays);
    const salaryGrades = safeArray(payload.salaryGrades);
    const workingDays = safeArray(payload.workingDays);
    const locations = safeArray(payload.locations);
    const approvalConfigs = safeArray(payload.approvalConfigs);

    await this.prisma.$transaction(async (tx) => {
      const buIds: string[] = [];
      for (const item of businessUnits) {
        const name = String(item?.name || '').trim();
        if (!name) continue;

        if (item?.id) {
          const updated = await tx.businessUnit.updateMany({
            where: { id: item.id, companyId },
            data: {
              name,
              code: item.code || '',
              lead: item.lead || null,
              notes: item.notes || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            buIds.push(item.id);
            continue;
          }
        }
        const existing = await tx.businessUnit.findUnique({
          where: { companyId_name: { companyId, name } },
        });
        if (existing) {
          const updated = await tx.businessUnit.update({
            where: { id: existing.id },
            data: {
              code: item.code || '',
              lead: item.lead || null,
              notes: item.notes || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          buIds.push(updated.id);
          continue;
        }
        const created = await tx.businessUnit.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name,
            code: item.code || '',
            lead: item.lead || null,
            notes: item.notes || null,
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        buIds.push(created.id);
      }
      await tx.businessUnit.updateMany({
        where: { companyId, id: { notIn: buIds.length ? buIds : ['__none__'] } },
        data: { isActive: false },
      });

      const branchIds: string[] = [];
      for (const item of branches) {
        if (item?.id) {
          const updated = await tx.branch.updateMany({
            where: { id: item.id, companyId },
            data: {
              name: item.name || '',
              code: item.code || '',
              city: item.city || null,
              managerId: item.manager || null,
              address: item.address || null,
              country: item.country || 'Tanzania',
              phone: item.phone || null,
              email: item.email || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            branchIds.push(item.id);
            continue;
          }
        }
        const created = await tx.branch.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name: item.name || '',
            code: item.code || '',
            city: item.city || null,
            managerId: item.manager || null,
            address: item.address || null,
            country: item.country || 'Tanzania',
            phone: item.phone || null,
            email: item.email || null,
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        branchIds.push(created.id);
      }
      await tx.branch.updateMany({
        where: { companyId, id: { notIn: branchIds.length ? branchIds : ['__none__'] } },
        data: { isActive: false },
      });

      const departmentIds: string[] = [];
      for (const item of departments) {
        if (item?.id) {
          const updated = await tx.department.updateMany({
            where: { id: item.id, companyId },
            data: {
              name: item.name || '',
              code: item.code || '',
              headId: item.head || null,
              description: item.description || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            departmentIds.push(item.id);
            continue;
          }
        }
        const created = await tx.department.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name: item.name || '',
            code: item.code || '',
            headId: item.head || null,
            description: item.description || null,
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        departmentIds.push(created.id);
      }
      await tx.department.updateMany({
        where: { companyId, id: { notIn: departmentIds.length ? departmentIds : ['__none__'] } },
        data: { isActive: false },
      });

      const sectionIds: string[] = [];
      for (const item of sections) {
        const name = String(item?.name || '').trim();
        if (!name) continue;

        if (item?.id) {
          const updated = await tx.section.updateMany({
            where: { id: item.id, companyId },
            data: {
              name,
              code: item.code || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            sectionIds.push(item.id);
            continue;
          }
        }
        const existing = await tx.section.findUnique({
          where: { companyId_name: { companyId, name } },
        });
        if (existing) {
          const updated = await tx.section.update({
            where: { id: existing.id },
            data: {
              code: item.code || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          sectionIds.push(updated.id);
          continue;
        }
        const created = await tx.section.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name,
            code: item.code || null,
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        sectionIds.push(created.id);
      }
      await tx.section.updateMany({
        where: { companyId, id: { notIn: sectionIds.length ? sectionIds : ['__none__'] } },
        data: { isActive: false },
      });

      const contractTypeIds: string[] = [];
      for (const item of contractTypes) {
        const name = String(item?.name || '').trim();
        if (!name) continue;

        if (item?.id) {
          const updated = await tx.contractType.updateMany({
            where: { id: item.id, companyId },
            data: {
              name,
              code: item.code || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            contractTypeIds.push(item.id);
            continue;
          }
        }
        const existing = await tx.contractType.findUnique({
          where: { companyId_name: { companyId, name } },
        });
        if (existing) {
          const updated = await tx.contractType.update({
            where: { id: existing.id },
            data: {
              code: item.code || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          contractTypeIds.push(updated.id);
          continue;
        }
        const created = await tx.contractType.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name,
            code: item.code || null,
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        contractTypeIds.push(created.id);
      }
      await tx.contractType.updateMany({
        where: { companyId, id: { notIn: contractTypeIds.length ? contractTypeIds : ['__none__'] } },
        data: { isActive: false },
      });

      const levelIds: string[] = [];
      for (const item of levels) {
        const name = String(item?.name || '').trim();
        if (!name) continue;

        if (item?.id) {
          const updated = await tx.grade.updateMany({
            where: { id: item.id, companyId },
            data: {
              name,
              rank: Number(item.rank || 0),
              code: item.code || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            levelIds.push(item.id);
            continue;
          }
        }
        const existing = await tx.grade.findUnique({
          where: { companyId_name: { companyId, name } },
        });
        if (existing) {
          const updated = await tx.grade.update({
            where: { id: existing.id },
            data: {
              rank: Number(item.rank || 0),
              code: item.code || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          levelIds.push(updated.id);
          continue;
        }
        const created = await tx.grade.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name,
            rank: Number(item.rank || 0),
            code: item.code || null,
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        levelIds.push(created.id);
      }
      await tx.grade.updateMany({
        where: { companyId, id: { notIn: levelIds.length ? levelIds : ['__none__'] } },
        data: { isActive: false },
      });

      const jobTitleIds: string[] = [];
      for (const item of jobTitles) {
        const name = String(item?.name || '').trim();
        if (!name) continue;

        if (item?.id) {
          const updated = await tx.jobTitle.updateMany({
            where: { id: item.id, companyId },
            data: {
              name,
              code: item.code || null,
              grade: item.level || item.grade || null,
              description: item.description || item.desc || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            jobTitleIds.push(item.id);
            continue;
          }
        }
        const existing = await tx.jobTitle.findUnique({
          where: { companyId_name: { companyId, name } },
        });
        if (existing) {
          const updated = await tx.jobTitle.update({
            where: { id: existing.id },
            data: {
              code: item.code || null,
              grade: item.level || item.grade || null,
              description: item.description || item.desc || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          jobTitleIds.push(updated.id);
          continue;
        }
        const created = await tx.jobTitle.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name,
            code: item.code || null,
            grade: item.level || item.grade || null,
            description: item.description || item.desc || null,
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        jobTitleIds.push(created.id);
      }
      await tx.jobTitle.updateMany({
        where: { companyId, id: { notIn: jobTitleIds.length ? jobTitleIds : ['__none__'] } },
        data: { isActive: false },
      });

      const positionIds: string[] = [];
      for (const item of positions) {
        const positionName = String(item?.title || item?.name || '').trim();
        if (!positionName) continue;

        if (item?.id) {
          const updated = await tx.position.updateMany({
            where: { id: item.id, companyId },
            data: {
              name: positionName,
              code: item.code || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            positionIds.push(item.id);
            continue;
          }
        }
        const existing = await tx.position.findUnique({
          where: { companyId_name: { companyId, name: positionName } },
        });
        if (existing) {
          const updated = await tx.position.update({
            where: { id: existing.id },
            data: {
              code: item.code || null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          positionIds.push(updated.id);
          continue;
        }
        const created = await tx.position.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name: positionName,
            code: item.code || null,
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        positionIds.push(created.id);
      }
      await tx.position.updateMany({
        where: { companyId, id: { notIn: positionIds.length ? positionIds : ['__none__'] } },
        data: { isActive: false },
      });

      const benefitIds: string[] = [];
      for (const item of benefits) {
        const maxAmount = item.maxAmount === '' || item.maxAmount === null || item.maxAmount === undefined
          ? null
          : Number(item.maxAmount);

        if (item?.id) {
          const updated = await tx.benefit.updateMany({
            where: { id: item.id, companyId },
            data: {
              name: item.name || '',
              description: item.desc || item.description || null,
              type: item.type || 'HEALTH',
              coverage: item.coverage || null,
              maxAmount: Number.isFinite(maxAmount as number) ? maxAmount : null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            benefitIds.push(item.id);
            continue;
          }
        }
        const created = await tx.benefit.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name: item.name || '',
            description: item.desc || item.description || null,
            type: item.type || 'HEALTH',
            coverage: item.coverage || null,
            maxAmount: Number.isFinite(maxAmount as number) ? maxAmount : null,
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        benefitIds.push(created.id);
      }
      await tx.benefit.updateMany({
        where: { companyId, id: { notIn: benefitIds.length ? benefitIds : ['__none__'] } },
        data: { isActive: false },
      });

      const holidayIds: string[] = [];
      for (const item of holidays) {
        const holidayDate = asDateOnly(item.date);
        if (!holidayDate) continue;

        if (item?.id) {
          const updated = await tx.publicHoliday.updateMany({
            where: { id: item.id, companyId },
            data: {
              name: item.name || '',
              date: holidayDate,
              isRecurring: !!item.isRecurring || String(item.type || '').toLowerCase() === 'recurring',
            },
          });
          if (updated.count > 0) {
            holidayIds.push(item.id);
            continue;
          }
        }
        const created = await tx.publicHoliday.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name: item.name || '',
            date: holidayDate,
            isRecurring: !!item.isRecurring || String(item.type || '').toLowerCase() === 'recurring',
          },
        });
        holidayIds.push(created.id);
      }
      if (holidayIds.length) {
        await tx.publicHoliday.deleteMany({ where: { companyId, id: { notIn: holidayIds } } });
      } else {
        await tx.publicHoliday.deleteMany({ where: { companyId } });
      }

      const salaryGradeIds: string[] = [];
      for (const item of salaryGrades) {
        if (item?.id) {
          const updated = await tx.salaryGrade.updateMany({
            where: { id: item.id, companyId },
            data: {
              name: item.name || '',
              code: item.code || null,
              rank: Number(item.rank || 0),
              minSalary: toNumberOrNull(item.minSalary),
              maxSalary: toNumberOrNull(item.maxSalary),
              currency: item.currency || 'TZS',
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            salaryGradeIds.push(item.id);
            continue;
          }
        }
        const created = await tx.salaryGrade.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name: item.name || '',
            code: item.code || null,
            rank: Number(item.rank || 0),
            minSalary: toNumberOrNull(item.minSalary),
            maxSalary: toNumberOrNull(item.maxSalary),
            currency: item.currency || 'TZS',
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        salaryGradeIds.push(created.id);
      }
      await tx.salaryGrade.updateMany({
        where: { companyId, id: { notIn: salaryGradeIds.length ? salaryGradeIds : ['__none__'] } },
        data: { isActive: false },
      });

      const workingDayIds: string[] = [];
      for (const item of workingDays) {
        if (item?.id) {
          const updated = await tx.workingDayPattern.updateMany({
            where: { id: item.id, companyId },
            data: {
              name: item.name || '',
              pattern: item.pattern || null,
              hours: item.hours || null,
              weekend: item.weekend || null,
              weekendDays: toJsonText(item.weekendDays || []),
              dayConfigs: toJsonText(item.dayConfigs || {}),
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            workingDayIds.push(item.id);
            continue;
          }
        }
        const created = await tx.workingDayPattern.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name: item.name || '',
            pattern: item.pattern || null,
            hours: item.hours || null,
            weekend: item.weekend || null,
            weekendDays: toJsonText(item.weekendDays || []),
            dayConfigs: toJsonText(item.dayConfigs || {}),
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        workingDayIds.push(created.id);
      }
      await tx.workingDayPattern.updateMany({
        where: { companyId, id: { notIn: workingDayIds.length ? workingDayIds : ['__none__'] } },
        data: { isActive: false },
      });

      const locationIds: string[] = [];
      for (const item of locations) {
        if (item?.id) {
          const updated = await tx.workspaceLocation.updateMany({
            where: { id: item.id, companyId },
            data: {
              name: item.name || '',
              code: item.code || null,
              city: item.city || null,
              country: item.country || null,
              type: item.type || null,
              address: item.address || null,
              radiusMeters: toNumberOrNull(item.radiusMeters),
              latitude: toNumberOrNull(item.latitude),
              longitude: toNumberOrNull(item.longitude),
              metadata: item.metadata ? toJsonText(item.metadata) : null,
              isActive: String(item.status || '').toLowerCase() !== 'inactive',
            },
          });
          if (updated.count > 0) {
            locationIds.push(item.id);
            continue;
          }
        }
        const created = await tx.workspaceLocation.create({
          data: {
            ...(item?.id ? { id: item.id } : {}),
            companyId,
            name: item.name || '',
            code: item.code || null,
            city: item.city || null,
            country: item.country || null,
            type: item.type || null,
            address: item.address || null,
            radiusMeters: toNumberOrNull(item.radiusMeters),
            latitude: toNumberOrNull(item.latitude),
            longitude: toNumberOrNull(item.longitude),
            metadata: item.metadata ? toJsonText(item.metadata) : null,
            isActive: String(item.status || '').toLowerCase() !== 'inactive',
          },
        });
        locationIds.push(created.id);
      }
      await tx.workspaceLocation.updateMany({
        where: { companyId, id: { notIn: locationIds.length ? locationIds : ['__none__'] } },
        data: { isActive: false },
      });

      const approvalIds: string[] = [];
      for (const item of approvalConfigs) {
        const moduleKey = item.moduleKey || 'ONBOARDING';
        const existing = await tx.workspaceApprovalConfig.findUnique({
          where: { companyId_moduleKey: { companyId, moduleKey } },
        });

        const data = {
          process: item.process || null,
          levels: Number(item.levels || 1),
          approvalMode: item.approvalMode || 'global',
          initiatorDepartments: toJsonText(item.initiatorDepartments || []),
          initiators: toJsonText(item.initiators || []),
          initiatorRule: item.initiatorRule || 'any',
          reviewerDepartments: toJsonText(item.reviewerDepartments || []),
          reviewers: toJsonText(item.reviewers || []),
          reviewerRule: item.reviewerRule || 'any',
          approverDepartments: toJsonText(item.approverDepartments || []),
          approvers: toJsonText(item.approvers || []),
          approverRule: item.approverRule || 'any',
          departmentAssignments: toJsonText(item.departmentAssignments || []),
          escalation: item.escalation || null,
          isActive: String(item.status || '').toLowerCase() !== 'inactive',
        };

        if (existing) {
          const updated = await tx.workspaceApprovalConfig.update({
            where: { id: existing.id },
            data,
          });
          approvalIds.push(updated.id);
        } else {
          const created = await tx.workspaceApprovalConfig.create({
            data: {
              ...(item?.id ? { id: item.id } : {}),
              companyId,
              moduleKey,
              ...data,
            },
          });
          approvalIds.push(created.id);
        }
      }
      await tx.workspaceApprovalConfig.updateMany({
        where: { companyId, id: { notIn: approvalIds.length ? approvalIds : ['__none__'] } },
        data: { isActive: false },
      });

      await tx.companySettings.upsert({
        where: { companyId },
        create: {
          companyId,
          generalSettings: JSON.stringify(payload || {}),
        },
        update: {
          generalSettings: JSON.stringify(payload || {}),
        },
      });
    }, { timeout: 120000, maxWait: 30000 });

    return { ok: true };
  }

  // ── Business Units ──

  @Get('business-units')
  @ApiOperation({ summary: 'List business units' })
  async listBusinessUnits(@Query('companyId') companyId: string) {
    return { data: await this.prisma.businessUnit.findMany({ where: { companyId }, orderBy: { name: 'asc' } }) };
  }

  @Post('business-units')
  @ApiOperation({ summary: 'Create business unit' })
  async createBusinessUnit(@Body() body: any) {
    return this.prisma.businessUnit.upsert({
      where: { companyId_name: { companyId: body.companyId, name: body.name } },
      create: { companyId: body.companyId, name: body.name, code: body.code },
      update: { code: body.code ?? undefined, isActive: true },
    });
  }

  @Put('business-units/:id')
  @ApiOperation({ summary: 'Update business unit' })
  async updateBusinessUnit(@Param('id') id: string, @Body() body: any) {
    return this.prisma.businessUnit.update({ where: { id }, data: { name: body.name, code: body.code } });
  }

  @Delete('business-units/:id')
  @ApiOperation({ summary: 'Delete business unit' })
  async deleteBusinessUnit(@Param('id') id: string) {
    return this.prisma.businessUnit.delete({ where: { id } });
  }

  // ── Sections ──

  @Get('sections')
  @ApiOperation({ summary: 'List sections' })
  async listSections(@Query('companyId') companyId: string) {
    return { data: await this.prisma.section.findMany({ where: { companyId }, orderBy: { name: 'asc' } }) };
  }

  @Post('sections')
  @ApiOperation({ summary: 'Create section' })
  async createSection(@Body() body: any) {
    return this.prisma.section.upsert({
      where: { companyId_name: { companyId: body.companyId, name: body.name } },
      create: { companyId: body.companyId, name: body.name, code: body.code },
      update: { code: body.code ?? undefined, isActive: true },
    });
  }

  @Put('sections/:id')
  @ApiOperation({ summary: 'Update section' })
  async updateSection(@Param('id') id: string, @Body() body: any) {
    return this.prisma.section.update({ where: { id }, data: { name: body.name, code: body.code } });
  }

  @Delete('sections/:id')
  @ApiOperation({ summary: 'Delete section' })
  async deleteSection(@Param('id') id: string) {
    return this.prisma.section.delete({ where: { id } });
  }

  // ── Job Titles ──

  @Get('job-titles')
  @ApiOperation({ summary: 'List job titles' })
  async listJobTitles(@Query('companyId') companyId: string) {
    return { data: await this.prisma.jobTitle.findMany({ where: { companyId }, orderBy: { name: 'asc' } }) };
  }

  @Post('job-titles')
  @ApiOperation({ summary: 'Create job title' })
  async createJobTitle(@Body() body: any) {
    return this.prisma.jobTitle.upsert({
      where: { companyId_name: { companyId: body.companyId, name: body.name } },
      create: { companyId: body.companyId, name: body.name, code: body.code, grade: body.grade },
      update: { code: body.code ?? undefined, grade: body.grade ?? undefined, isActive: true },
    });
  }

  @Put('job-titles/:id')
  @ApiOperation({ summary: 'Update job title' })
  async updateJobTitle(@Param('id') id: string, @Body() body: any) {
    return this.prisma.jobTitle.update({ where: { id }, data: { name: body.name, code: body.code, grade: body.grade } });
  }

  @Delete('job-titles/:id')
  @ApiOperation({ summary: 'Delete job title' })
  async deleteJobTitle(@Param('id') id: string) {
    return this.prisma.jobTitle.delete({ where: { id } });
  }

  // ── Grades ──

  @Get('grades')
  @ApiOperation({ summary: 'List grades' })
  async listGrades(@Query('companyId') companyId: string) {
    return { data: await this.prisma.grade.findMany({ where: { companyId }, orderBy: { rank: 'asc' } }) };
  }

  @Post('grades')
  @ApiOperation({ summary: 'Create grade' })
  async createGrade(@Body() body: any) {
    return this.prisma.grade.upsert({
      where: { companyId_name: { companyId: body.companyId, name: body.name } },
      create: { companyId: body.companyId, name: body.name, rank: body.rank || 0 },
      update: { rank: body.rank ?? 0, isActive: true },
    });
  }

  @Put('grades/:id')
  @ApiOperation({ summary: 'Update grade' })
  async updateGrade(@Param('id') id: string, @Body() body: any) {
    return this.prisma.grade.update({ where: { id }, data: { name: body.name, rank: body.rank } });
  }

  @Delete('grades/:id')
  @ApiOperation({ summary: 'Delete grade' })
  async deleteGrade(@Param('id') id: string) {
    return this.prisma.grade.delete({ where: { id } });
  }

  // ── Positions ──

  @Get('positions')
  @ApiOperation({ summary: 'List positions' })
  async listPositions(@Query('companyId') companyId: string) {
    return { data: await this.prisma.position.findMany({ where: { companyId }, orderBy: { name: 'asc' } }) };
  }

  @Post('positions')
  @ApiOperation({ summary: 'Create position' })
  async createPosition(@Body() body: any) {
    return this.prisma.position.upsert({
      where: { companyId_name: { companyId: body.companyId, name: body.name } },
      create: { companyId: body.companyId, name: body.name, code: body.code },
      update: { code: body.code ?? undefined, isActive: true },
    });
  }

  @Put('positions/:id')
  @ApiOperation({ summary: 'Update position' })
  async updatePosition(@Param('id') id: string, @Body() body: any) {
    return this.prisma.position.update({ where: { id }, data: { name: body.name, code: body.code } });
  }

  @Delete('positions/:id')
  @ApiOperation({ summary: 'Delete position' })
  async deletePosition(@Param('id') id: string) {
    return this.prisma.position.delete({ where: { id } });
  }

  // ── Contract Types ──

  @Get('contract-types')
  @ApiOperation({ summary: 'List contract types' })
  async listContractTypes(@Query('companyId') companyId: string) {
    return { data: await this.prisma.contractType.findMany({ where: { companyId }, orderBy: { name: 'asc' } }) };
  }

  @Post('contract-types')
  @ApiOperation({ summary: 'Create contract type' })
  async createContractType(@Body() body: any) {
    return this.prisma.contractType.upsert({
      where: { companyId_name: { companyId: body.companyId, name: body.name } },
      create: { companyId: body.companyId, name: body.name, code: body.code },
      update: { code: body.code ?? undefined, isActive: true },
    });
  }

  @Put('contract-types/:id')
  @ApiOperation({ summary: 'Update contract type' })
  async updateContractType(@Param('id') id: string, @Body() body: any) {
    return this.prisma.contractType.update({ where: { id }, data: { name: body.name, code: body.code } });
  }

  @Delete('contract-types/:id')
  @ApiOperation({ summary: 'Delete contract type' })
  async deleteContractType(@Param('id') id: string) {
    return this.prisma.contractType.delete({ where: { id } });
  }
}
