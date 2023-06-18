import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(
        'mongodb+srv://ddevtk:Duongbui%40123@cluster0.ostbbe9.mongodb.net/?retryWrites=true&w=majority',
      ),
  },
];
