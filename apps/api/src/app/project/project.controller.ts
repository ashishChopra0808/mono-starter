import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  createProjectSchema,
  updateProjectSchema,
} from '@mono/validation';
import type { CreateProject, UpdateProject } from '@mono/validation';
import { paginationQuerySchema } from '@mono/api-contracts';
import type { PaginationQuery } from '@mono/api-contracts';

import { ZodValidationPipe } from '../../validation/zod-validation.pipe';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ) {
    return this.projectService.list(query);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return { data: this.projectService.getById(id) };
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createProjectSchema)) body: CreateProject,
  ) {
    return { data: this.projectService.create(body) };
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateProjectSchema)) body: UpdateProject,
  ) {
    return { data: this.projectService.update(id, body) };
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.projectService.delete(id);
    return { data: { deleted: true as const } };
  }
}
