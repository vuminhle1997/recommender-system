import {Movie, Rating, ResultScore} from './interface';
import {dotProduct, euclideanNorm, meanByVectors} from '../utils/utils'

class UURecommender {
    private readonly userRatings: Map<number, Rating[]>;
    private readonly movies: Movie[];
    private readonly MAX_THRESHOLD = 30;

    constructor(
        movies: Movie[],
        userRatings: Map<number, Rating[]>
    ) {
        this.movies = movies;
        this.userRatings = userRatings;
    }

    computeScoreForUserWithDetails(user: number) {
        const ratingsOfUserU = this.userRatings.get(user)!;

        const V = structuredClone(this.userRatings);
        for (const [userV, userRatingsOfV] of V) {
            const avg = meanByVectors(userRatingsOfV);
            const newUserRatingsOfV = structuredClone(userRatingsOfV);
            userRatingsOfV.forEach((rating, i) => {

                const r = newUserRatingsOfV.find((r_) => r_.movieId === rating.movieId)!;
                r.score = r.score - avg;
                newUserRatingsOfV[i] = r;
                V.set(userV, newUserRatingsOfV);
            })
        }

        const similaritiesWithAnotherUsers: Map<number, number> = new Map();
        for (const userV of V.keys()) {
            if (userV !== user) {
                const vRatings = V.get(userV)!;

                const numerator = dotProduct(V.get(user)!, vRatings);
                const denominator = euclideanNorm(vRatings) * euclideanNorm(V.get(user)!);
                const sim = numerator / denominator;
                if (sim > 0) {
                    similaritiesWithAnotherUsers.set(userV, sim);
                }
            }
        }

        const list = Array.from(similaritiesWithAnotherUsers, (v) => ({
            user: v[0],
            similarity: v[1]
        })).sort((a, b) => b.similarity - a.similarity);
        const results: ResultScore[] = [];
        for (const movieItem of this.movies) {
            let numerator = 0, denominator = 0;
            let i = 0;
            for (const sim of list) {
                const {user, similarity} = sim;
                if (i >= this.MAX_THRESHOLD) break;
                if (V.get(user)) {
                    const ratings = V.get(user);
                    if (ratings) {
                        const rating = ratings.find(r => r.movieId === movieItem.movieId);
                        if (rating) {
                            i++;
                            numerator += rating.score * similarity;
                            denominator += similarity;
                        }
                    }

                }
            }
            if (denominator === 0 || i < 2) {
                results.push(({movie: movieItem.movieId, score: 0}))
            } else {
                const avg = meanByVectors(ratingsOfUserU)
                const score = avg + numerator / denominator;
                results.push(({movie: movieItem.movieId, score: score}))
            }
        }
        return results.sort((a, b) => b.score - a.score);
    }
}

export default UURecommender;
