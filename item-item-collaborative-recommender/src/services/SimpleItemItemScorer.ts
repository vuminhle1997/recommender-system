import {SimpleItemModel} from "./SimpleItemModel";
import {Movie, Rating} from "./interface";

export class SimpleItemScorer {
    private readonly model: SimpleItemModel;
    private readonly SIZE = 20;

    constructor(model: SimpleItemModel) {
        this.model = model;
    }

    /**
     * Gives a score for a movie "i" for a user "u".
     * Returns a score for a movie "i".
     * @param u - User
     * @param i - Movie
     */
    scoreWithDetailsForMovie(u: number, i: Movie) {
        const itemMeans = this.model.getItemMeans;
        const uRatings = this.model.getUserRatings(u);

        const ratings = this.normalizeUserRatings(uRatings, itemMeans);
        const {movieId} = i;
        const mean = itemMeans.get(movieId);
        const similarityMatrix = this.model.getNeighbors(movieId);
        if (similarityMatrix && mean) {
            const itemScore = this.calculateItemScore(similarityMatrix, ratings, mean);
            if (itemScore > 0)
                return ({movie: i, score: itemScore})
            else return ({movie: i, score: 0})
        }
    }

    /**
     * Gives a score for each movie for a user "u".
     * Returns a list, sorted descending by the "score" property.
     * @param user
     * @param movies
     */
    scoreWithDetailsSelectedMovies(user: number, movies: Movie[]) {
        const itemMeans = this.model.getItemMeans;
        const uRatings = this.model.getUserRatings(user);

        const ratings = this.normalizeUserRatings(uRatings, itemMeans);
        const results: ({ movie: Movie; score: number })[] = [];
        movies.forEach((movie) => {
            const {movieId} = movie;
            const mean = itemMeans.get(movieId);
            const similarityMatrix = this.model.getNeighbors(movieId);
            if (similarityMatrix && mean) {
                const itemScore = this.calculateItemScore(similarityMatrix, ratings, mean);
                if (itemScore > 0) {
                    results.push(({movie: movie, score: itemScore}));
                }
            }
        });
        const sorted = results.sort((a, b) => b.score - a.score)
        return sorted;
    }

    /**
     * Calculates the score for an item "i".
     * @param similarityMatrix similarity matrix between "i" & "j"
     * @param ratings ratings of user "u"
     * @param mean - Mean of item "i"
     * @private
     */
    private calculateItemScore(similarityMatrix: Map<number, number>, ratings: Rating[], mean: number) {
        const sims = Array.from(similarityMatrix, (v) => ({
            anotherMovie: v[0],
            similarity: v[1]
        })).sort((a, b) => b.similarity - a.similarity)
        let i = 0, numerator = 0, denominator = 0;
        for (const neighbor of sims) {
            if (i >= this.SIZE) {
                break;
            }
            const {similarity: w, anotherMovie} = neighbor;
            const ratingScore = ratings.find((r) => r.movieId === anotherMovie);
            if (ratingScore) {
                const {score: r} = ratingScore
                numerator += w * r;
                denominator += w;
                i++;
            }
        }
        const itemScore = (numerator / denominator) + mean;
        return itemScore;
    }

    /**
     * Normalizes the user ratings by subtracting each rating score with the mean the rated movie.
     * @param ratings
     * @param itemMeans
     * @private
     */
    private normalizeUserRatings(ratings: Rating[], itemMeans: Map<number, number>) {
        return ratings.map((r) => {
            const {movieId, score, userId} = r;
            const mean = itemMeans.get(movieId);
            if (mean) {
                const newRating: Rating = {
                    movieId,
                    userId,
                    score: score - mean,
                }
                return newRating;
            } else {
                return r;
            }
        });
    }
}