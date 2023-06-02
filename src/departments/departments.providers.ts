import { Mongoose } from 'mongoose';
import { DepartmentSchema } from './schemas/department.schema';

export const DepartmentsProviders = [
  {
    provide: 'DEPARTMENT_MODEL',
    useFactory: (mongoose: Mongoose) =>
      mongoose.model('Department', DepartmentSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
