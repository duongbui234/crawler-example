import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Counter {
  @Prop({ required: true })
  collectionName: string;
  @Prop({ default: 10000 })
  sequence_value: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);

export async function getNextSequenceValue(
  collectionName: string,
): Promise<number> {
  await mongoose.connect(process.env.DATABASE_URL);

  const couter = mongoose.model('Counter', CounterSchema);
  const sequenceDoc = await couter
    .findOneAndUpdate(
      { collectionName },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true },
    )
    .exec();
  console.log(sequenceDoc.sequence_value);
  return sequenceDoc.sequence_value;
}
