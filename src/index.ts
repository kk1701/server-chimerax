import express from 'express';
import mongoose from 'mongoose';
import env from 'dotenv';
import authRouter from './authRoutess/authRoute';
import UserMutation from './user/mutation';
import UserQuery from './user/query';
import User, { User as UserClass } from './models/user';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import jwt from 'jsonwebtoken';
import { buildSchema } from 'type-graphql';
import { decodeIDToken } from './middleware/authMiddleware';
import firebaseRouter from './middleware/authRoutes';

process.on('uncaughtException', function (err) {
  console.error(err);
  console.log('Node NOT Exiting...');
});

export interface Context {
  user?: UserClass;
}
env.config();
const app = express();
app.use(cors());
app.use(express.json());
// app.use(decodeIDToken);

// app.use('/api', authRouter);
app.use('/auth', firebaseRouter);

const schema = buildSchema({
  validate: false,
  resolvers: [
    UserQuery,
    UserMutation,

    // leaderboardResolver
  ],
  dateScalarMode: 'timestamp',

  //authChecker: authorizationLevel
});

app.use('/graphql', decodeIDToken, async (req, res, next) => {
  const userID = req.uid;
  let user: UserClass | null = null;
  if (userID) {
    try {
      user = await User.findOne({ firebase_uid: userID });
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
      return null;
    }
  }
  const resolvedSchema = await schema;
  return graphqlHTTP({
    schema: resolvedSchema,
    context: {
      user,
    },
    graphiql: true,
  })(req, res);
});

mongoose
  .connect(process.env.DB_URL)
  .then(() =>
    app.listen(process.env.PORT || 8080, async () => {
      console.log(`listening on port ${process.env.PORT || 8080}`);
    })
  )
  .catch((error) => {
    console.error(error);
  });
