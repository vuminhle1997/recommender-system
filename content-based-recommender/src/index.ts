import fs from 'fs';
import path from 'path';
import { parse } from 'csv';
import ContentBasedRecommender from './services/ContentBasedRecommender';
import UserProfileBuilder from './services/UserProfileBuilder';
import TFIDFItemScorer from './services/TFIDFItemScorer';

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
    })
    .on('close', () => console.log('finished'));
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
  //   console.log(RATINGS);
  for (const movie of MOVIES) {
    const id = movie[0];
    for (let i = 0; i < TAGS.length; i++) {
      const TAG = TAGS[i];

      if (TAG[1] === id) {
        const t = TAG[2];
        if (movie[3]) {
          movie[3].push(t);
        } else {
          const arr: any[] = [];
          arr.push(t);
          movie.push(arr);
        }
      }
    }
    if (movie[3]) {
      movie[3] = [...new Set(movie[3])];
    }
  }
  const recommender = new ContentBasedRecommender(MOVIES);
  const RATINGS = await pendingRatings;

  const userProfileBuilder = new UserProfileBuilder(recommender);
  const ratingsOfUserONE = RATINGS.filter((rating) => rating[0] === '1');
  const profilePreferences = userProfileBuilder.createUserProfilePreferences(
    ratingsOfUserONE!
  );
  const recommendations = TFIDFItemScorer.scoreWithDetails(
    movies,
    profilePreferences,
    recommender.getModelData
  );
}

main();
