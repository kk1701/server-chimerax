import { getModelForClass, prop, index } from "@typegoose/typegoose";
import { Field, ObjectType, Int, registerEnumType } from "type-graphql";

export enum Status {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  PENDING = "PENDING",
}
registerEnumType(Status, {
  name: "Status",
  description: "status of invitation",
});

@ObjectType()
export class Invitation {
  @Field({ nullable: true })
  _id?: string;

  @Field({ nullable: true })
  id?: string;

  @Field()
  @prop({ required: true })
  sendersId: string;

  @Field()
  @prop({ required: true })
  sendersName?: string;

  @Field()
  @prop({ required: true })
  sendersEmail?: string;

  @Field()
  @prop({ required: true })
  receiversName?: string;

  @Field()
  @prop({ required: true })
  receiversEmail?: string;

  @Field()
  @prop({ required: true })
  receiversId: string;

  @Field((type) => Status)
  @prop({ enum: Status, default: Status.PENDING })
  status: Status;
}

export default getModelForClass(Invitation);
