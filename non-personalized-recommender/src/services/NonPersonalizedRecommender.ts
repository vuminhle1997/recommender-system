import { DAMPING } from '../config';

export class NonPersonalizedRecommender {
  private readonly damping: number;
  private items: Map<string, Array<string[]>>;
  private meanScores: Map<string, number>;
  private dampedMeanScores: Map<string, number>;

  constructor(items: Map<string, Array<string[]>>) {
    this.damping = DAMPING;
    this.items = items;
    this.meanScores = new Map<string, number>();
    this.dampedMeanScores = new Map<string, number>();
    this.initializeMeanScores();
    this.initializeDampedMeanScores();
  }

  /**
   * Generate mean value for every tv-series by its ratings.
   * @private
   */
  private initializeMeanScores() {
    const scores = new Map<string, number>();
    this.items.forEach((ratings, movieTitle) => {
      let sum: number = 0;
      ratings.forEach((rating, i) => {
        const score = Number(rating[2].substring(0, rating[2].indexOf('/')));

        sum += score;
      });
      scores.set(movieTitle, sum / ratings.length);
    });
    this.meanScores = scores;
  }

  /**
   * Generate mean value for every tv-series by its ratings, adapted by the damping
   * factor and the global mean μ.
   * @private
   */
  private initializeDampedMeanScores() {
    const scores = new Map<string, number>();
    let uMeanSize = 0;
    let uMean = 0;
    this.items.forEach((ratings, movieTitle) => {
      ratings.forEach((rating, i) => {
        const score = Number(rating[2].substring(0, rating[2].indexOf('/')));
        uMean += score;
        uMeanSize++;
      });
    });
    uMean = uMean / uMeanSize;
    this.items.forEach((ratings, movieTitle) => {
      let sum = 0;
      ratings.forEach((rating, i) => {
        const score = Number(rating[2].substring(0, rating[2].indexOf('/')));
        sum += score;
      });
      const dampingFactor = this.damping * uMean;
      const numerator = sum + dampingFactor;
      const denominator = ratings.length + this.damping;
      const mean = numerator / denominator;
      scores.set(movieTitle, mean);
    });
    this.dampedMeanScores = scores;
  }

  /**
   * Returns the means of every movie.
   */
  get getMeanScores() {
    return this.meanScores;
  }

  /**
   * Returns the damped means of every movie.
   */
  get getDampedMeanScores() {
    return this.dampedMeanScores;
  }

  /**
   * Returns the top-N tv-series by the mean scores.
   * @param n
   */
  getTopNTVSeriesByMeanScores(n: number): Array<Map<string, number>> {
    const unsortedRatings = new Array<Map<string, number>>();
    for (const [key, value] of this.meanScores) {
      const rating = new Map<string, number>().set(key, value);
      unsortedRatings.push(rating);
    }
    unsortedRatings.sort((o1, o2) => {
      for (const [key1, value1] of o1) {
        for (const [key2, value2] of o2) {
          if (value1 < value2) return 1;
          if (value1 > value2) return -1;
          if (value1 === value2) return 0;
        }
      }
      return 0;
    });
    return unsortedRatings.slice(0, n);
  }


  /**
   * Returns the top-N tv-series by the damped mean scores.
   * @param n
   */
  getTopNTVSeriesByDampedMeanScores(n: number): Array<Map<string, number>> {
    const unsortedRatings = new Array<Map<string, number>>();
    for (const [key, value] of this.dampedMeanScores) {
      const rating = new Map<string, number>().set(key, value);
      unsortedRatings.push(rating);
    }
    unsortedRatings.sort((o1, o2) => {
      for (const [key1, value1] of o1) {
        for (const [key2, value2] of o2) {
          if (value1 < value2) return 1;
          if (value1 > value2) return -1;
          if (value1 === value2) return 0;
        }
      }
      return 0;
    });
    return unsortedRatings.slice(0, n);
  }
}
