import * as csv from 'csv';
import fs from 'fs';
import path from 'path';
import { AssociationRecommender, NonPersonalizedRecommender } from './services';

const ids = [...Array(75).keys()];

const parser = csv.parse({
  delimiter: ',',
  from: 2,
});

const strigifier = csv.stringify({
  header: true,
  columns: [
    'movieTitle',
    'reviewTitle',
    'rating',
    'content',
    'helpfulnessVote',
    'userId',
  ],
});

const items = new Map<string, Array<string[]>>();
const arr = new Array<string[]>();

/**
 * If the there are user ids set, do this
 */
if (fs.existsSync(path.join(process.cwd(), 'data', 'comments_id.csv'))) {
  fs.createReadStream(path.join(process.cwd(), 'data', 'comments_id.csv'))
    .pipe(parser)
    .on('data', (r: string[]) => {
      const id = r[0];
      if (items.has(id)) {
        const array = items.get(id);
        if (array) {
          array.push(r);
          items.set(id, array);
        }
      } else {
        const array = new Array<string[]>();
        array.push(r);
        items.set(id, array);
      }
    })
    .on('end', () => {
      const recommender = new NonPersonalizedRecommender(items);
      const topG = recommender.getTopNTVSeriesByMeanScores(100);
      const bottomG = recommender.getTopNTVSeriesByDampedMeanScores(100);

      const associationRecommender = new AssociationRecommender(items);
      const assocMatrix = associationRecommender.getAssociationMatrix;
      const recommendationsForSquidGame =
        associationRecommender.getTopNOfAssociationMatrix(30, 'Squid Game');

      const json = {};
      for (const [key, val] of assocMatrix) {
        const obj = {
          [key]: {},
        };
        for (const [k, v] of val) {
          Object.assign(obj[key], { [k]: v });
        }
        Object.assign(json, obj);
      }
      const jsonString = JSON.stringify(json);
      fs.writeFile(
        path.join(process.cwd(), 'data', 'assocMatrix.json'),
        jsonString,
        'utf8',
        () => {
          console.log('Wrote association matrix');
        }
      );
    });
} else {
  /**
   * Otherwise, take random user id and insert it, generate new recommendations.
   */
  fs.createReadStream(path.join(process.cwd(), 'data', 'comments.csv'))
    .pipe(parser)
    .on('data', (r: string[]) => {
      const copy = [...r];
      const userId = ids[Math.floor(Math.random() * ids.length)];
      copy.push('' + userId);
      arr.push(r);
      const id = r[0];
      if (items.has(id)) {
        const array = items.get(id);
        if (array) {
          array.push(r);
          items.set(id, array);
        }
      } else {
        const array = new Array<string[]>();
        array.push(r);
        items.set(id, array);
      }
      strigifier.write(copy);
    })
    .on('end', () => {
      const recommender = new NonPersonalizedRecommender(items);
      const meanScores = recommender.getMeanScores;
      const dampedMeanScores = recommender.getDampedMeanScores;
      const topG = recommender.getTopNTVSeriesByMeanScores(100);
      const bottomG = recommender.getTopNTVSeriesByDampedMeanScores(100);
    });
  strigifier.pipe(
    fs.createWriteStream(path.join(process.cwd(), 'data', 'comments_id.csv'))
  );
}
