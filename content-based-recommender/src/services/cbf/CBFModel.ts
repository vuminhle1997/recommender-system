import {ItemVectorsProps, Movie} from "../interface";

/**
 * The CBFModel stores all tfidf-vector of all elements (in this case, movies).
 */
export class CBFModel {
    private readonly itemVectors: ItemVectorsProps[];
    constructor(itemVectors: ItemVectorsProps[]) {
        this.itemVectors = itemVectors;
    }

    /**
     * Access the tfidf-vector of a movie.
     * @param movie
     */
    getItemVector(movie: Movie) {
        const itemVector = this.itemVectors.find((iv) => iv.movie.movieId === movie.movieId);
        if (itemVector) return itemVector;
        return {
            movie: movie,
            frequencies: new Map<string, number>(),
        }
    }
}