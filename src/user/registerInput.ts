import { InputType, Field, ObjectType, registerEnumType } from 'type-graphql';
import { Invitation } from '../models/invitation';
import { QuestionAnswerType, QuestionType } from '../models/questions';
import { QuestionResponse, TeamStatus } from '../models/team';
import { type } from 'os';
import { UserQuizStatus } from '../models/user';

@InputType()
export class UserInput {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  year: number;

  @Field({ nullable: true })
  city: string;

  @Field({ nullable: true })
  college: string;

  @Field({ nullable: true })
  referralCode: string;
}

@InputType()
export class InvitationInput {
  @Field()
  receiverId: string;

  @Field()
  receiverName: string;

  @Field()
  receiverEmail: string;
}

@InputType()
export class AcceptInvitationInput {
  @Field()
  invitationId: string;

  @Field()
  receiverId: string;
}

@InputType()
export class DeleteInvitationInput {
  @Field()
  invitationId: string;
}

@InputType()
export class PayOrderInput {
  @Field()
  paymentId: string;
}

@InputType()
export class CreateOrderInput {
  @Field()
  teamName: string;

  @Field({ nullable: true })
  referralCode: string;
}

@ObjectType()
export class InvitationResponse {
  @Field((type) => [Invitation])
  sentInvitations: [Invitation];

  @Field((type) => [Invitation])
  receivedInvitations: [Invitation];
}

@ObjectType()
export class GetQuestionResponse {
  @Field({ nullable: true })
  _id?: string;

  @Field({ nullable: true })
  id?: string;

  @Field()
  question: string;

  @Field()
  questionAssets?: string;

  @Field()
  questionNo?: number;
}

@ObjectType()
export class Order {
  @Field()
  id: string;

  @Field()
  amount: number;

  @Field()
  currency: string;
}

@InputType()
export class CreateQuestionInput {
  @Field()
  question: string;

  @Field()
  questionType: QuestionType;

  @Field()
  questionAnswerType: QuestionAnswerType;

  @Field()
  answer: string;

  @Field({ nullable: true })
  answer2: string;

  @Field()
  questionNumber: number;

  @Field({ nullable: true })
  questionAssets: string;

  @Field()
  firstAnswerLabel: string;

  @Field({ nullable: true })
  secondAnswerLabel: string;
}

@InputType()
export class QuestionAnswer {
  @Field()
  questionId: string;

  @Field()
  answer: string;

  @Field()
  questionNumber: number;

  @Field({ nullable: true })
  answer2: string;
}

@InputType()
export class SubmitQuizInput {
  @Field((type) => [QuestionAnswer])
  responses: [QuestionAnswer];
}

@InputType()
export class CreateReferralCodeInput {
  @Field()
  code: string;
}

@ObjectType()
export class Member {
  @Field()
  userId: string;

  @Field()
  name: string;

  @Field()
  email: string;
}

@ObjectType()
export class TeamResponse {
  @Field((type) => Member)
  teamLeader: Member;

  @Field((type) => Member, { nullable: true })
  teamHelper: Member;

  @Field((type) => TeamStatus)
  status: TeamStatus;

  @Field((type) => String, { nullable: true })
  teamName: String;
}

@ObjectType()
export class CreateReferralCodeResponse {
  @Field()
  _id: string;

  @Field()
  code: string;
}

@ObjectType()
export class QuizDetailsResponse {
  @Field()
  quizStartTime: string;

  @Field((type) => UserQuizStatus)
  userQuizStatus: UserQuizStatus;
}

@ObjectType()
export class StartQuizResponse {
  @Field()
  quizStartTime: string;
}

@InputType()
export class ByPassPaymentInput {
  @Field()
  TeamLeaderEmail: String;

  @Field()
  TeamName: String;
  @Field()
  PaymentId: String;
}
