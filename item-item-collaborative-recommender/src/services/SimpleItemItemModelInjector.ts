import {Movie, Rating} from "./interface";
import {dotProduct, euclideanNorm, meanByVectors} from "../utils/utils";
import {SimpleItemModel} from "./SimpleItemModel";

export interface MovieBoxAttributes {
    movie: Movie;
    ratings: Rating[];
}

export class SimpleItemItemModelInjector {
    private readonly movies: Movie[];
    private readonly allRatings: Rating[];
    private movieBoxes: MovieBoxAttributes[];

    constructor(movies: Movie[], ratings: Rating[]) {
        this.movies = movies;
        this.allRatings = ratings;
        const movieBoxes: MovieBoxAttributes[] = [];
        movies.forEach((m, i) => {
            const {movieId} = m;
            const movieRatings = ratings.filter((r) => r.movieId === movieId);
            movieBoxes.push(({movie: m, ratings: movieRatings}));
        });
        this.movieBoxes = movieBoxes;
    }

    get() {
        const itemVectors: MovieBoxAttributes[] = [];
        const itemMeans: Map<number, number> = new Map();

        this.movieBoxes.forEach((item, i) => {
            const movieId = item.movie.movieId;
            const itemRatings = item.ratings;

            // <userId, ratingScore>
            const ratings: Rating[] = [];

            const mean = meanByVectors(itemRatings);
            itemMeans.set(movieId, mean);

            itemRatings.forEach((rating) => {
                const {userId, score, movieId} = rating;
                const changedRating: Rating = {
                    userId,
                    movieId,
                    score: score - mean
                }
                ratings.push(changedRating);
            });
            itemVectors.push(({movie: item.movie, ratings: ratings}));
        });

        // <movieId, <anotherMovieId, similarityScore>>
        const itemSimilarities: Map<number, Map<number, number>> = new Map();
        for (const {
            movie: {
                movieId: i
            }, ratings: iRatings
        } of itemVectors) {
            // <anotherMovieId, similarityScore>
            const similarities: Map<number, number> = new Map();
            for (const {
                movie: {
                    movieId: j
                }, ratings: jRatings
            } of itemVectors) {
                if (i !== j) {
                    const numerator = dotProduct(iRatings, jRatings);
                    const denominator = euclideanNorm(iRatings) * euclideanNorm(jRatings);
                    const cosineSimilarity = numerator / denominator;

                    if (cosineSimilarity > 0) similarities.set(j, cosineSimilarity);
                }
            }
            itemSimilarities.set(i, similarities);
        }
        return new SimpleItemModel(itemMeans, itemSimilarities, this.allRatings);
    }
}