import { Context } from '../index';
import UserModel, { User, Step, UserQuizStatus } from '../models/user';
import 'reflect-metadata';
import { Resolver, Query, Ctx, Authorized } from 'type-graphql';
import {
  InvitationResponse,
  TeamResponse,
  QuizDetailsResponse,
} from './registerInput';
import InvitationModel, { Invitation, Status } from '../models/invitation';
import QuestionModel from '../models/questions';
import TeamModel, { TeamStatus } from '../models/team';
import { Question } from '../models/questions';
import user from '../models/user';

@Resolver()
export default class QueryClass {
  @Query((returns) => User)
  // @Authorized("USER")
  async viewer(@Ctx() context: Context) {
    try {
      const user = await UserModel.findOne({ email: context.user.email });
      user.id = user._id;
      user.password = '';
      return user;
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Query((returns) => InvitationResponse)
  async getInvitations(@Ctx() context: Context) {
    try {
      const sentInvitations = await InvitationModel.find({
        sendersId: context.user._id,
      });
      const receivedInvitations = await InvitationModel.find({
        receiversId: context.user._id,
      });

      return {
        sentInvitations: sentInvitations,
        receivedInvitations: receivedInvitations,
      };
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Query((returns) => [User])
  async getSingleUsers(@Ctx() context: Context) {
    try {
      const singleUsers: User[] = await UserModel.find({
        step: Step.CHOOSE_TEAM,
        city: context.user.city,
      });
      const sentInvitations: Invitation[] = await InvitationModel.find({
        sendersId: context.user._id,
      });
      const alreadysentInvititaion = sentInvitations.map((invititaion) => {
        return invititaion.receiversId.toString();
      });
      const filteredUsers = singleUsers.filter((user) => {
        const exist = alreadysentInvititaion.find(
          (invity) => invity === user._id.toString()
        );
        if (
          user._id.toString() === context.user._id.toString() ||
          Boolean(exist)
        )
          return false;
        return true;
      });
      // const filteredUsers = filter(singleUsers, (user) => {
      //   const exists = find(
      //     sentInvitations,
      //     (invitation) => invitation.receiversId === user._id.toString()
      //   );
      //   // console.log(
      //   //   context.user._id,
      //   //   user._id,
      //   //   context.user._id.toString() == user._id
      //   // );
      //   if (
      //     user._id.toString() === context.user._id.toString() ||
      //     Boolean(exists)
      //   ) {
      //     return false;
      //   }
      //   return true;
      // });

      return filteredUsers;
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Query((returns) => [Question])
  async getQuestions(@Ctx() context: Context) {
    try {
      if (context.user.step != Step.TEST) {
        throw new Error('Please complete payment to give the test');
      }
      const questions = await QuestionModel.find();

      const a = await questions.map((question) => {
        return {
          question: question.question,
          answer: '',
          questionNo: question.questionNo,
          questionType: question.questionType,
          questionAssets: question.questionAssets,
          id: question._id,
          questionAnswerType: question.questionAnswerType,
          firstAnswerLabel: question.firstAnswerLabel,
          secondAnswerLabel: question.secondAnswerLabel,
        };
      });

      // console.log(a);
      return a;
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Query((returns) => TeamResponse)
  async getTeamDetails(@Ctx() context: Context) {
    try {
      if (
        context.user.step == Step.REGISTER ||
        context.user.step == Step.CHOOSE_TEAM
      ) {
        throw new Error('Invalid Step');
      }
      const team = await TeamModel.findById(context.user.teamId);
      const leader = await UserModel.findById(team.teamLeadersId);

      if (team.teamStatus === TeamStatus.INDIVIDUAL) {
        return {
          teamLeader: {
            userId: team.teamLeadersId,
            name: leader.name,
            email: leader.email,
          },
          status: team.teamStatus,
          teamName: team.teamName ?? '',
        };
      }
      const helper = await UserModel.findById(team.teamHelpersId);

      return {
        teamLeader: {
          userId: team.teamLeadersId,
          name: leader.name,
          email: leader.email,
        },
        status: team.teamStatus,
        teamHelper: {
          userId: team.teamHelpersId,
          name: helper.name,
          email: helper.email,
        },
        teamName: team.teamName ?? '',
      };
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong! try again');
    }
  }

  @Query((returns) => QuizDetailsResponse)
  async getQuizDetails(@Ctx() context: Context) {
    try {
      const user = await UserModel.findById(context.user._id);

      // if (user.quizStatus != UserQuizStatus.STARTED) {
      //   throw new Error("Quiz has ended or not started");
      // }

      return {
        quizStartTime: user.quizStartTime,
        userQuizStatus: user.quizStatus,
      };
    } catch (e) {
      // console.log(e);
      throw new Error('Something went wrong');
    }
  }
}
