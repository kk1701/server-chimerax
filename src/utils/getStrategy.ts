export const getStrategy = (strategy: string) => {
  switch (strategy) {
    case 'password':
      return 'LOCAL';
    case 'google.com':
      return 'GOOGLE';
    case 'facebook.com':
      return 'FACEBOOK';
    default:
      return 'FIREBASE';
  }
};
