import { Context } from '../index';
import UserModel, { User, Step, Role, UserQuizStatus } from '../models/user';
import TeamModel, {
  Team,
  TeamStatus,
  PaymentStatus,
  QuizStatus,
} from '../models/team';
import Razorpay from 'razorpay';
import 'reflect-metadata';
import { Resolver, Arg, Ctx, Mutation, Authorized, Args } from 'type-graphql';
import {
  UserInput,
  InvitationInput,
  AcceptInvitationInput,
  DeleteInvitationInput,
  Order,
  PayOrderInput,
  CreateOrderInput,
  CreateQuestionInput,
  SubmitQuizInput,
  StartQuizResponse,
  CreateReferralCodeResponse,
  CreateReferralCodeInput,
  ByPassPaymentInput,
} from './registerInput';
import ReferralCodeModel, { ReferralCode } from '../models/referralCodes';
import InvitationModel, { Invitation, Status } from '../models/invitation';
import { nanoid } from 'nanoid';
import axios from 'axios';
import env from 'dotenv';
import QuestionModel, {
  Question,
  QuestionAnswerType,
} from '../models/questions';
import { STATUS_CODES } from 'http';
env.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

@Resolver()
export default class MutationClass {
  @Mutation((returns) => User)
  async registerUser(
    @Arg('userInfo') userInput: UserInput,
    @Ctx() context: Context
  ) {
    try {
      const payload: Partial<UserInput> = {
        ...userInput,
      };

      const user = await UserModel.findOneAndUpdate(
        { email: context.user.email },
        {
          $set: { ...payload, step: Step.CHOOSE_TEAM },
        },
        {
          new: true,
        }
      );

      if (!user) return null;

      return user;
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Mutation((returns) => Invitation)
  async sendInvitation(
    @Arg('invitationInput') invitationInput: InvitationInput,
    @Ctx() context: Context
  ) {
    try {
      const invitation = await new InvitationModel({
        receiversId: invitationInput.receiverId,
        receiversName: invitationInput.receiverName,
        receiversEmail: invitationInput.receiverEmail,
        sendersId: context.user._id,
        sendersEmail: context.user.email,
        sendersName: context.user.name,
        id: nanoid(),
      }).save();

      return invitation;
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Mutation((returns) => Team)
  async acceptInvitation(
    @Arg('acceptInvitationInput') acceptInvitationInput: AcceptInvitationInput,
    @Ctx() context: Context
  ) {
    try {
      const senderId = context.user._id;
      const receiverId = acceptInvitationInput.receiverId;

      const sender = await UserModel.findById(senderId);
      const receiver = await UserModel.findById(receiverId);

      if (
        sender.teamStatus != TeamStatus.NOT_INITIALIZED ||
        receiver.teamStatus != TeamStatus.NOT_INITIALIZED
      ) {
        throw new Error('Player already in other team');
      }
      const invitation = await InvitationModel.findByIdAndUpdate(
        { _id: acceptInvitationInput.invitationId },
        { status: Status.ACCEPTED },
        { new: true }
      );

      if (!invitation) {
        throw new Error('Invalid invitation Id');
      }

      const team = await new TeamModel({
        teamLeadersId: receiverId,
        teamHelpersId: senderId,
        invitationId: invitation._id,
        city: sender.city,
        teamStatus: TeamStatus.TEAM,
      }).save();

      await UserModel.findByIdAndUpdate(senderId, {
        step: Step.PAYMENT,
        teamId: team._id,
        teamStatus: TeamStatus.TEAM,
        role: Role.TEAM_HELPER,
      });
      await UserModel.findByIdAndUpdate(receiverId, {
        step: Step.PAYMENT,
        teamId: team._id,
        teamStatus: TeamStatus.TEAM,
        role: Role.TEAM_LEADER,
      });

      return team;
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Mutation((returns) => Invitation)
  async deleteInvitation(
    @Arg('deleteInvitationInput') deleteInvitationInput: DeleteInvitationInput,
    @Ctx() context: Context
  ) {
    try {
      const invitation = await InvitationModel.findByIdAndDelete({
        _id: deleteInvitationInput.invitationId,
      });

      if (!invitation) {
        throw new Error('Invalid invitation Id');
      }

      return invitation;
    } catch {
      throw new Error('Something went wrong! try again');
    }
  }

  @Mutation((returns) => Team)
  async playAsIndividual(@Ctx() context: Context) {
    try {
      const user = await UserModel.findById(context.user._id);
      if (!user || user.teamStatus != TeamStatus.NOT_INITIALIZED) {
        throw new Error('Invalid User');
      }

      const team = await new TeamModel({
        teamLeadersId: user._id,
        teamHelpersId: '',
        invitationId: user._id,
        city: user.city,
        teamStatus: TeamStatus.INDIVIDUAL,
      }).save();

      await UserModel.findByIdAndUpdate(user._id, {
        step: Step.PAYMENT,
        teamId: team._id,
        teamStatus: TeamStatus.INDIVIDUAL,
        role: Role.TEAM_LEADER,
      });
      return team;
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Mutation((returns) => Order)
  async createOrder(
    @Ctx() context: Context,
    @Arg('createOrderInput') createOrderInput: CreateOrderInput
  ) {
    try {
      const user = await UserModel.findById(context.user._id);
      const team = await TeamModel.findById(user.teamId);

      if (
        !user ||
        user.step != Step.PAYMENT ||
        user.teamStatus === TeamStatus.NOT_INITIALIZED ||
        user.role != Role.TEAM_LEADER ||
        !team
      ) {
        return new Error('Invalid User');
      }

      if (Boolean(createOrderInput.referralCode)) {
        const code = await ReferralCodeModel.findOne({
          code: createOrderInput.referralCode,
        });
        if (Boolean(code)) {
          await ReferralCodeModel.findByIdAndUpdate(code._id, {
            count: code.count + 1,
          });
        } else {
          return new Error('Invalid Referral code');
        }
      }
      const options = {
        amount: 10000,
        currency: 'INR',
        receipt: nanoid(),
        payment_capture: 1,
      };
      const response = await razorpay.orders.create(options);

      await TeamModel.findByIdAndUpdate(user.teamId, {
        teamName: createOrderInput.teamName,
      });

      return {
        id: response.id,
        currency: response.currency,
        amount: response.amount,
      };
    } catch (e) {
      return new Error(e);
    }
  }

  @Mutation((returns) => Team)
  async payOrder(
    @Arg('payOrderInput') payOrderInput: PayOrderInput,
    @Ctx() context: Context
  ) {
    try {
      const user = await UserModel.findById(context.user._id);
      const team = await TeamModel.findById(user.teamId);

      if (
        !user ||
        user.step != Step.PAYMENT ||
        user.teamStatus === TeamStatus.NOT_INITIALIZED ||
        user.role != Role.TEAM_LEADER ||
        !team
      ) {
        throw new Error('Invalid User');
      }
      const payment = await axios.get(
        `https://${process.env.RAZORPAY_KEY}:${process.env.RAZORPAY_SECRET}@api.razorpay.com/v1/payments/${payOrderInput.paymentId}`
      );

      if (!payment.data.captured) {
        throw new Error('Payment was not completed, please try again');
      }

      await UserModel.findByIdAndUpdate(team.teamLeadersId, {
        step: Step.TEST,
        paymentId: payOrderInput.paymentId,
      });
      if (team.teamStatus === TeamStatus.TEAM) {
        await UserModel.findByIdAndUpdate(team.teamHelpersId, {
          step: Step.TEST,
          paymentId: payOrderInput.paymentId,
        });
      }

      const updatedTeam = await TeamModel.findByIdAndUpdate(team._id, {
        status: PaymentStatus.PAID,
      });
      return updatedTeam;
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Mutation((returns) => Question)
  async createQuestion(
    @Arg('createQuestionInput') createQuestionInput: CreateQuestionInput,
    @Ctx() context: Context
  ) {
    try {
      const userId = context.user._id;
      const user = await UserModel.findById(userId);

      if (user.role != Role.ADMIN) {
        throw new Error('Unauthorized');
      }
      const {
        question,
        questionAssets,
        questionNumber,
        questionType,
        answer,
        questionAnswerType,
        firstAnswerLabel,
        secondAnswerLabel,
        answer2,
      } = createQuestionInput;
      const newQuestion = await new QuestionModel({
        question,
        questionNo: questionNumber,
        questionType,
        questionAssets,
        questionAnswerType,
        firstAnswerLabel,
        secondAnswerLabel,
        answer,
        answer2,
      }).save();

      return newQuestion;
    } catch (e) {
      // console.log(e);
      throw new Error(e);
    }
  }

  @Mutation((returns) => Team)
  async submitQuiz(
    @Arg('submitQuizInput') submitQuizInput: SubmitQuizInput,
    @Ctx() context: Context
  ) {
    try {
      const userId = context.user._id;
      const user = await UserModel.findById(userId);
      const team = await TeamModel.findById(context.user.teamId);
      let currentEndTime;
      await axios
        .get('https://worldtimeapi.org/api/timezone/Asia/Kolkata')
        .then((response) => {
          // console.log(response.data)
          currentEndTime = response.data.datetime;
        });

      await UserModel.findByIdAndUpdate(userId, {
        quizEndTime: currentEndTime,
        quizStatus: UserQuizStatus.ENDED,
      });
      if (user.role === Role.TEAM_HELPER) {
        return team;
      }

      const questions = await QuestionModel.find();

      if (team.quizStatus === QuizStatus.SUBMITTED) {
        throw new Error('Quiz has been already submitted');
      }

      if (user.role != Role.TEAM_LEADER) {
        throw new Error('Unauthorized');
      }

      let score: number = 0;

      submitQuizInput.responses.forEach((response) => {
        const rightAnswer = questions.find(
          (question) => question.id === response.questionId
        );

        const variations = rightAnswer.answer.trim().split(',');
        // console.log(variations);
        const exists = variations.find(
          (ans) =>
            ans.trim().toLowerCase() === response.answer.trim().toLowerCase()
        );
        if (rightAnswer.questionAnswerType === QuestionAnswerType.SINGLE) {
          // console.log("score", score);
          if (Boolean(exists)) score = score + 2;
        } else {
          const variations2 = rightAnswer.answer2.trim().split(',');
          const exists2 = variations2.find(
            (ans) =>
              ans.trim().toLowerCase() === response.answer2.trim().toLowerCase()
          );

          if (Boolean(exists)) {
            score = ++score;
          }
          if (Boolean(exists2)) score = ++score;
        }
      });

      const updatedTeam = TeamModel.findByIdAndUpdate(team._id, {
        score,
        quizStatus: QuizStatus.SUBMITTED,
      });

      return updatedTeam;
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Mutation((returns) => StartQuizResponse)
  async startQuiz(@Ctx() context: Context) {
    try {
      const userId = context.user._id;
      let currentTime;
      await axios
        .get('https://worldtimeapi.org/api/timezone/Asia/Kolkata')
        .then((response) => {
          // console.log(response.data)
          currentTime = response.data.datetime;
        });
      //  console.log(currentTime);
      const user = await UserModel.findByIdAndUpdate(userId, {
        quizStatus: UserQuizStatus.STARTED,
        quizStartTime: currentTime,
      });

      return { quizStartTime: user.quizStartTime };
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Mutation((returns) => CreateReferralCodeResponse)
  async createReferralCode(
    @Arg('createReferralCodeInput')
    createReferralCodeInput: CreateReferralCodeInput,
    @Ctx() context: Context
  ) {
    try {
      if (context.user.role != Role.ADMIN) throw new Error('Unauthorized');

      const referralCode = await new ReferralCodeModel({
        code: createReferralCodeInput.code,
      }).save();

      return referralCode;
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }
  @Mutation((returns) => Team)
  async byPassPayment(
    @Arg('byPassPaymentInput') byPassPaymentInput: ByPassPaymentInput,
    @Ctx() context: Context
  ) {
    try {
      if (context.user.role != Role.ADMIN) throw new Error('Unauthorized');

      const user = await UserModel.findOne({
        email: byPassPaymentInput.TeamLeaderEmail,
      });
      if (!Boolean(user)) throw new Error('Invalid User');

      if (user.step != Step.PAYMENT || user.role != Role.TEAM_LEADER)
        throw new Error('Invalid Step or Role');

      await UserModel.findByIdAndUpdate(user._id, {
        step: Step.TEST,
        paymentId: byPassPaymentInput.PaymentId,
      });
      const team = await TeamModel.findByIdAndUpdate(user.teamId, {
        status: PaymentStatus.PAID,
        teamName: byPassPaymentInput.TeamName,
      });
      if (team.teamHelpersId) {
        await UserModel.findByIdAndUpdate(team.teamHelpersId, {
          step: Step.TEST,
          paymentId: byPassPaymentInput.PaymentId,
        });
      }
      return team;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
