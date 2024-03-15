import { getModelForClass, prop, index } from "@typegoose/typegoose";
import { Field, ObjectType, Int, registerEnumType } from "type-graphql";

@ObjectType()
export class ReferralCode {
  @Field({ nullable: true })
  _id?: string;

  @Field()
  @prop({ required: true })
  code: string;

  @Field()
  @prop({ nullable: true, default: 0 })
  count?: number;
}

export default getModelForClass(ReferralCode);
