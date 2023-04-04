import fs from 'fs';
import path from 'path';
import { parse } from 'csv';
import {Movie, Rating} from './services/interface';
import UURecommender from './services/UURecommender';

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

  const userRatings = new Map<number, Rating[]>();
  RATINGS.forEach((r) => {
    const rating = new Rating(Number(r[1]), Number(r[0]), Number(r[2]));
    if (userRatings.has(Number(r[0]))) {
      const arr = userRatings.get(Number(r[0]));
      if (arr) {
        arr.push(rating);
        userRatings.set(Number(r[0]), arr);
      } else {
        const arr: Rating[] = [];
        arr.push(rating);
        userRatings.set(Number(r[0]), arr);
      }
    } else {
      const arr: Rating[] = [];
      arr.push(rating);
      userRatings.set(Number(r[0]), arr);
    }
  });

  const movies: Movie[] = [];
  const selectedMovies: Movie[] = [];
  MOVIES.forEach((movie) => {
    const movieId = movie[0];
    const m = new Movie(Number(movieId), movie[1], movie[2]);
    if (movieId == 260 || movieId == 153 || movieId == 527 || movieId == 588) selectedMovies.push(m);
    movies.push(m);
  });

  const recommender = new UURecommender(selectedMovies, userRatings);
  const for1 = recommender.computeScoreForUserWithDetails(320);
}

main();
