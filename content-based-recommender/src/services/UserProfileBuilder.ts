import ContentBasedRecommender from './ContentBasedRecommender';

/**
 *
 * 0: userId
 * 1: movieId
 * 2: rating
 * 4: timestamp
 */
class UserProfileBuilder {
  private model: ContentBasedRecommender;
  constructor(model: ContentBasedRecommender) {
    this.model = model;
  }

  createUserProfilePreferences(ratings: string[][]): Map<string, number> {
    const tfidfVectors = this.model.getModelData;
    const profile: Map<string, number> = new Map();

    let sum = 0;
    ratings.forEach((rating) => {
      const score = rating[2];
      sum += Number(score);
    });
    const avgSum = sum / ratings.length;

    ratings.forEach((rating) => {
      const movieId = rating[1];
      const itemVector = tfidfVectors.get(Number(movieId));
      if (itemVector) {
        for (const [key, value] of itemVector) {
          const weightedValue = (Number(rating[2]) - avgSum) * value;
          if (profile.has(key)) {
            profile.set(key, profile.get(key)! + weightedValue);
          } else {
            profile.set(key, weightedValue);
          }
        }
      }
    });
    return profile;
  }
}

export default UserProfileBuilder;
