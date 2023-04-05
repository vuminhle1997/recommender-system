import fs from 'fs';
import path from 'path';
import { parse } from 'csv';
import {Movie, Rating} from "./services/interface";
import {CBFModelInjector} from "./services/cbf/CBFModelInjector";
import {CBFRecommender} from "./services/cbf/CBFRecommender";
import {DAOContainer} from "./services/cbf/DAOContainer";

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

/**
 * 0: userId
 * 1: movieId
 * 2: tag
 * 3: timestamp
 */
const tags: any[][] = [];

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

const pendingTags = new Promise<any[][]>((resolve) => {
  parser = parse({
    delimiter: ',',
    from: 2,
  });
  fs.createReadStream(path.join(process.cwd(), 'data', 'tags.csv'))
    .pipe(parser)
    .on('data', (r) => {
      tags.push(r);
    })
    .on('end', () => {
      resolve(tags);
    });
});

async function main() {
  const MOVIES = await pendingMovies;
  const TAGS = await pendingTags;
  const RATINGS = await pendingRatings;

  const ratingList: Rating[] = [];
  for (const rating of RATINGS) {
    const r = new Rating(Number(rating[1]), Number(rating[0]), Number(rating[2]))
    ratingList.push(r);
  }

  const tagsOfMovies: Map<number, string[]> = new Map();
  for (const tag of TAGS) {
    const movieId = Number(tag[0]);
    if (!tagsOfMovies.has(movieId)) {
      const tags: string[] = [];
      tags.push(tag[2]);
      tagsOfMovies.set(movieId, tags);
    } else {
      const tags = structuredClone(tagsOfMovies.get(movieId)!);
      tags.push(tag[2]);
      tagsOfMovies.set(movieId, tags);
    }
  }

  const movieList: Movie[] = [];
  for (const movie of MOVIES) {
    const id = Number(movie[0]);
    const m = new Movie(id, movie[1], movie[2]);
    if (tagsOfMovies.has(id)) {
      const tags = tagsOfMovies.get(id)!;
      m.tags = tags;
    }
    movieList.push(m);
  }

  const daoContainer = new DAOContainer(movieList, ratingList);
  const model = CBFModelInjector.get(movieList);
  const recommender = new CBFRecommender(daoContainer, model);
  const result = recommender.scoreWithDetails(320, movieList);
  const top20 = result.slice(0, 20)
  console.log(top20);
}

main();
