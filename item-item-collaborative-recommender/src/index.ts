import fs from 'fs';
import path from 'path';
import {parse} from 'csv';
import {Movie, Rating} from './services/interface';
import {SimpleItemItemModelInjector} from "./services/SimpleItemItemModelInjector";
import {SimpleItemScorer} from "./services/SimpleItemItemScorer";

let parser = parse({
    delimiter: ',',
    from: 2,
});

/**
 * 0: userId
 * 1: movieId
 * 2: rating
 * 4: timestamp
 */
const ratings: any[][] = [];

/**
 * 0: movieId
 * 1: title
 * 2: genre
 */
const movies: any[][] = [];

const pendingRatings = new Promise<any[][]>((resolve) => {
    parser = parse({
        delimiter: ',',
        from: 2,
    });
    fs.createReadStream(path.join(process.cwd(), 'data', 'ratings.csv'))
        .pipe(parser)
        .on('data', (r) => {
            ratings.push(r);
        })
        .on('end', () => {
            resolve(ratings);
        });
});

const pendingMovies = new Promise<any[][]>((resolve) => {
    parser = parse({
        delimiter: ',',
        from: 2,
    });
    fs.createReadStream(path.join(process.cwd(), 'data', 'movies.csv'))
        .pipe(parser)
        .on('data', (r) => {
            movies.push(r);
        })
        .on('end', () => {
            resolve(movies);
        });
});

async function main() {
    const MOVIES = await pendingMovies;
    const RATINGS = await pendingRatings;

    const allRatings: Rating[] = [];
    RATINGS.forEach(r => {
        const rating = new Rating(Number(r[1]), Number(r[0]), Number(r[2]));
        allRatings.push(rating);
    });

    const movieList: Movie[] = [];
    const selectedMovies: Movie[] = [];
    MOVIES.forEach((movie) => {
        const m = new Movie(Number(movie[0]), movie[1], movie[2]);
        const id = movie[0]
        if (id == 153 || id == 260 || id == 527 || id == 588) selectedMovies.push(m);
        movieList.push(m);
    });

    const model = new SimpleItemItemModelInjector(movieList, allRatings).get();
    const recommender = new SimpleItemScorer(model);
    // shows the score of the selected movies (like the java project)
    const recommendations = recommender.scoreWithDetailsSelectedMovies(320, selectedMovies);
    console.log(recommendations);
}

main();
