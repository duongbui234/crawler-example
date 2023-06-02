import { Module } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { DepartmentsProviders } from './departments.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, ...DepartmentsProviders],
})
export class DepartmentsModule {}
