import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class DocumentService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async uploadDocument(data: any) {
    const doc = await this.prisma.document.create({ data });
    return this.toDocResponse(doc);
  }

  async getDocument(id: string) {
    return this.prisma.document.findUnique({ where: { id } });
  }

  async deleteDocument(id: string) {
    await this.prisma.document.delete({ where: { id } });
    return { success: true, message: 'Document deleted' };
  }

  async listDocuments(employeeId: string) {
    const docs = await this.prisma.document.findMany({
      where: { employeeId },
      orderBy: { uploadedAt: 'desc' },
    });
    return { documents: docs.map((d) => this.toDocResponse(d)) };
  }

  private toDocResponse(d: any) {
    return {
      id: d.id, employeeId: d.employeeId, category: d.category,
      fileName: d.fileName, fileUrl: d.fileUrl, version: d.version,
      uploadedAt: d.uploadedAt?.toISOString() || '',
    };
  }
}
