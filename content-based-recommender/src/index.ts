import fs from 'fs';
import path from 'path';
import { parse } from 'csv';

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
const ratings: any[] = [];

/**
 * 0: movieId
 * 1: title
 * 2: genre
 */
const movies: any[] = [];

/**
 * 0: userId
 * 1: movieId
 * 2: tag
 * 3: timestamp
 */
const tags: any[] = [];

const pendingRatings = new Promise<any[]>((resolve) => {
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
    })
    .on('close', () => console.log('finished'));
});

const pendingMovies = new Promise<any[]>((resolve) => {
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

const pendingTags = new Promise<any[]>((resolve) => {
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
  const RATINGS = await pendingRatings;
  const MOVIES = await pendingMovies;
  const TAGS = await pendingTags;
  //   console.log(RATINGS);
}

main();
