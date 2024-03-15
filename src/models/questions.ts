import { getModelForClass, prop, index } from "@typegoose/typegoose";
import { Field, ObjectType, Int, registerEnumType } from "type-graphql";

export enum QuestionType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}
registerEnumType(QuestionType, {
  name: "QuestionType",
  description: "type of question",
});

export enum QuestionAnswerType {
  SINGLE = "SINGLE",
  DOUBLE = "DOUBLE",
}
registerEnumType(QuestionAnswerType, {
  name: "QuestionAnswerType",
  description: "type of answer question is having",
});

@ObjectType()
export class Question {
  @Field({ nullable: true })
  _id?: string;

  @Field({ nullable: true })
  id?: string;

  @Field()
  @prop({ required: true })
  question: string;

  @Field({ nullable: true })
  @prop({ default: "" })
  questionAssets?: string;

  @Field()
  @prop({ required: true })
  firstAnswerLabel?: string;

  @Field({ nullable: true })
  @prop({ default: "" })
  secondAnswerLabel?: string;

  @Field()
  @prop({ required: true })
  answer?: string;

  @Field({ nullable: true })
  @prop({ default: "" })
  answer2?: string;

  @Field()
  @prop({ required: true })
  questionNo?: number;

  @Field((type) => QuestionType)
  @prop({ enum: QuestionType, required: true })
  questionType: QuestionType;

  @Field((type) => QuestionAnswerType)
  @prop({ enum: QuestionAnswerType, required: true })
  questionAnswerType: QuestionAnswerType;
}

export default getModelForClass(Question);
