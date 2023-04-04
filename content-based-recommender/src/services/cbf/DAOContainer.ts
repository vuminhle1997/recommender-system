import {Movie, Rating} from "../interface";

/**
 * Stores all immutable movies and ratings.
 */
export class DAOContainer {
    public readonly movies: Movie[];
    public readonly ratings: Rating[];

    constructor(movies: Movie[], ratings: Rating[]) {
        this.movies = movies;
        this.ratings = ratings;
    }
}