import { Body, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Counter } from 'src/models/counter.schema';

@Injectable()
export class CounterService {
  constructor(@InjectModel(Counter.name) private counter: Model<Counter>) {}

  async getNextSequenceValue(collectionName: string): Promise<number> {
    console.log(
      '🚀 ~ file: counter.schema.ts:18 ~ collectionName:',
      collectionName,
    );
    const sequenceDoc = await this.counter
      .findOneAndUpdate(
        { collectionName },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true },
      )
      .exec();
    console.log(sequenceDoc.sequence_value);
    return sequenceDoc.sequence_value;
  }
}
