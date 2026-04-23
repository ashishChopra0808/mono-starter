import { randomUUID } from 'node:crypto';

import type { PaginationQuery } from '@mono/api-contracts';
import type {
  CreateProject,
  Project,
  UpdateProject,
} from '@mono/validation';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProjectService {
  private readonly projects = new Map<string, Project>();

  list(query: PaginationQuery): { data: Project[]; meta: { page: number; limit: number; totalCount: number; totalPages: number } } {
    const all = [...this.projects.values()];

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';
    const sorted = all.sort((a, b) => {
      const aVal = String(a[sortBy as keyof Project] ?? '');
      const bVal = String(b[sortBy as keyof Project] ?? '');
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    const totalCount = sorted.length;
    const totalPages = Math.ceil(totalCount / query.limit) || 1;
    const start = (query.page - 1) * query.limit;
    const data = sorted.slice(start, start + query.limit);

    return { data, meta: { page: query.page, limit: query.limit, totalCount, totalPages } };
  }

  getById(id: string): Project {
    const project = this.projects.get(id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  create(input: CreateProject): Project {
    const now = new Date().toISOString();
    const project: Project = {
      id: randomUUID(),
      name: input.name,
      description: input.description,
      status: input.status,
      ownerId: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(project.id, project);
    return project;
  }

  update(id: string, input: UpdateProject): Project {
    const existing = this.getById(id);
    const updated: Project = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    if (!this.projects.has(id)) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    this.projects.delete(id);
  }
}
