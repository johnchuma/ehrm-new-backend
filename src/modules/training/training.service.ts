import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not linked');
    return { employeeId: user.employeeId, companyId: user.companyId };
  }

  async getAvailableTrainings(userId: string) {
    const { companyId, employeeId } = await this.resolveEmployee(userId);
    const trainings = await this.prisma.training.findMany({
      where: { companyId, isActive: true },
      include: {
        enrollments: {
          where: { employeeId },
          select: { status: true, enrolledAt: true, completedAt: true, score: true },
        },
      },
      orderBy: [{ isMandatory: 'desc' }, { startDate: 'asc' }],
    });
    return trainings.map((t) => ({
      ...t,
      myEnrollment: t.enrollments[0] ?? null,
      enrollments: undefined,
    }));
  }

  async getMyEnrollments(userId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    return this.prisma.trainingEnrollment.findMany({
      where: { employeeId },
      include: { training: true },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async enroll(userId: string, trainingId: string) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    const training = await this.prisma.training.findFirst({
      where: { id: trainingId, companyId, isActive: true },
      include: { enrollments: { select: { id: true } } },
    });
    if (!training) throw new NotFoundException('Training not found');
    if (training.maxSlots && training.enrollments.length >= training.maxSlots)
      throw new BadRequestException('Training is fully booked');

    return this.prisma.trainingEnrollment.upsert({
      where: { employeeId_trainingId: { employeeId, trainingId } },
      create: { employeeId, companyId, trainingId, status: 'ENROLLED' },
      update: { status: 'ENROLLED' },
      include: { training: true },
    });
  }

  async markComplete(userId: string, trainingId: string, score?: number) {
    const { employeeId } = await this.resolveEmployee(userId);
    const enrollment = await this.prisma.trainingEnrollment.findFirst({
      where: { employeeId, trainingId },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return this.prisma.trainingEnrollment.update({
      where: { id: enrollment.id },
      data: { status: 'COMPLETED', completedAt: new Date(), score },
    });
  }

  // Admin: create training
  async createTraining(companyId: string, dto: any) {
    return this.prisma.training.create({ data: { ...dto, companyId } });
  }

  async getTrainingById(companyId: string, id: string) {
    const t = await this.prisma.training.findFirst({
      where: { id, companyId },
      include: { enrollments: { include: { employee: { select: { employeeNumber: true, user: { select: { fullName: true } } } } } } },
    });
    if (!t) throw new NotFoundException('Training not found');
    return t;
  }
}
