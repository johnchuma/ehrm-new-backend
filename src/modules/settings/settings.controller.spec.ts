import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { SettingsController } from './settings.controller';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('SettingsController workspace routes', () => {
  let app: INestApplication;

  const mockPrisma: any = {
    companySettings: {
      findUnique: jest.fn(),
    },
    businessUnit: { findMany: jest.fn() },
    branch: { findMany: jest.fn() },
    department: { findMany: jest.fn() },
    section: { findMany: jest.fn() },
    contractType: { findMany: jest.fn() },
    grade: { findMany: jest.fn() },
    jobTitle: { findMany: jest.fn() },
    position: { findMany: jest.fn() },
    benefit: { findMany: jest.fn() },
    publicHoliday: { findMany: jest.fn() },
    salaryGrade: { findMany: jest.fn() },
    workingDayPattern: { findMany: jest.fn() },
    workspaceLocation: { findMany: jest.fn() },
    workspaceApprovalConfig: { findMany: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /settings/workspace/:companyId returns table-backed workspace data', async () => {
    mockPrisma.companySettings.findUnique.mockResolvedValue({
      companyId: 'company-1',
      generalSettings: JSON.stringify({ locations: [{ id: 'legacy-loc', name: 'Legacy Office' }] }),
    });

    mockPrisma.businessUnit.findMany.mockResolvedValue([]);
    mockPrisma.branch.findMany.mockResolvedValue([]);
    mockPrisma.department.findMany.mockResolvedValue([]);
    mockPrisma.section.findMany.mockResolvedValue([]);
    mockPrisma.contractType.findMany.mockResolvedValue([]);
    mockPrisma.grade.findMany.mockResolvedValue([]);
    mockPrisma.jobTitle.findMany.mockResolvedValue([]);
    mockPrisma.position.findMany.mockResolvedValue([]);
    mockPrisma.benefit.findMany.mockResolvedValue([]);
    mockPrisma.publicHoliday.findMany.mockResolvedValue([]);
    mockPrisma.salaryGrade.findMany.mockResolvedValue([
      {
        id: 'sg-1',
        name: 'Grade A',
        code: 'GA',
        rank: 1,
        minSalary: 1000000,
        maxSalary: 2000000,
        currency: 'TZS',
        isActive: true,
      },
    ]);
    mockPrisma.workingDayPattern.findMany.mockResolvedValue([
      {
        id: 'wd-1',
        name: 'HQ Pattern',
        pattern: 'Mon-Fri',
        hours: '08:00-17:00',
        weekend: 'Sat-Sun',
        weekendDays: JSON.stringify(['SATURDAY', 'SUNDAY']),
        dayConfigs: JSON.stringify({ MONDAY: { enabled: true, start: '08:00', end: '17:00' } }),
        isActive: true,
      },
    ]);
    mockPrisma.workspaceLocation.findMany.mockResolvedValue([
      {
        id: 'loc-1',
        name: 'Head Office',
        code: 'HO',
        city: 'Dar es Salaam',
        country: 'Tanzania',
        type: 'Head Office',
        address: null,
        radiusMeters: 150,
        latitude: -6.7924,
        longitude: 39.2083,
        metadata: null,
        isActive: true,
      },
    ]);
    mockPrisma.workspaceApprovalConfig.findMany.mockResolvedValue([
      {
        id: 'ap-1',
        moduleKey: 'ONBOARDING',
        process: 'Onboarding',
        levels: 3,
        approvalMode: 'global',
        initiatorDepartments: JSON.stringify([]),
        initiators: JSON.stringify(['HR Manager']),
        initiatorRule: 'any',
        reviewerDepartments: JSON.stringify([]),
        reviewers: JSON.stringify(['CEO']),
        reviewerRule: 'any',
        approverDepartments: JSON.stringify([]),
        approvers: JSON.stringify(['CEO']),
        approverRule: 'any',
        departmentAssignments: JSON.stringify([]),
        escalation: null,
        isActive: true,
      },
    ]);

    const res = await request(app.getHttpServer())
      .get('/settings/workspace/company-1')
      .expect(200);

    expect(Array.isArray(res.body.salaryGrades)).toBe(true);
    expect(Array.isArray(res.body.workingDays)).toBe(true);
    expect(Array.isArray(res.body.locations)).toBe(true);
    expect(Array.isArray(res.body.approvalConfigs)).toBe(true);
    expect(res.body.salaryGrades[0].name).toBe('Grade A');
    expect(res.body.locations.some((item: any) => item.name === 'Head Office')).toBe(true);
  });

  it('PUT /settings/workspace/:companyId persists new dedicated settings tables', async () => {
    const tx: any = {
      businessUnit: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'bu-1' }) },
      branch: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'br-1' }) },
      department: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'dep-1' }) },
      section: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'sec-1' }) },
      contractType: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'ct-1' }) },
      grade: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'gr-1' }) },
      jobTitle: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'jt-1' }) },
      position: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'pos-1' }) },
      benefit: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'ben-1' }) },
      publicHoliday: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'hol-1' }), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      salaryGrade: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'sg-1' }) },
      workingDayPattern: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'wd-1' }) },
      workspaceLocation: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), create: jest.fn().mockResolvedValue({ id: 'loc-1' }) },
      workspaceApprovalConfig: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'ap-1' }),
        update: jest.fn().mockResolvedValue({ id: 'ap-1' }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      companySettings: { upsert: jest.fn().mockResolvedValue({ companyId: 'company-1' }) },
    };

    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(tx));

    await request(app.getHttpServer())
      .put('/settings/workspace/company-1')
      .send({
        salaryGrades: [{ name: 'Grade A', rank: 1, minSalary: 1000000, maxSalary: 2000000, currency: 'TZS' }],
        workingDays: [{ name: 'HQ', pattern: 'Mon-Fri', hours: '08:00-17:00', weekend: 'Sat-Sun', weekendDays: ['SATURDAY', 'SUNDAY'], dayConfigs: { MONDAY: { enabled: true } } }],
        locations: [{ name: 'Head Office', city: 'Dar es Salaam', type: 'Head Office', radiusMeters: 150, latitude: -6.7924, longitude: 39.2083 }],
        approvalConfigs: [{ moduleKey: 'ONBOARDING', process: 'Onboarding', levels: 3, approvalMode: 'global', initiators: ['HR Manager'], reviewers: ['CEO'], approvers: ['CEO'] }],
      })
      .expect(200);

    expect(tx.salaryGrade.create).toHaveBeenCalled();
    expect(tx.workingDayPattern.create).toHaveBeenCalled();
    expect(tx.workspaceLocation.create).toHaveBeenCalled();
    expect(tx.workspaceApprovalConfig.create).toHaveBeenCalled();
    expect(tx.companySettings.upsert).toHaveBeenCalled();
  });
});
