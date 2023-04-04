import { ItemVectorsProps, Movie } from '../interface';
import { CBFModel } from './CBFModel';

/**
 * The CBFModelInjector creates a set of tfidf-vectors and is necessary to inject these elements inside a model for
 * faster access.
 */
export class CBFModelInjector {
  /**
   * Static method for initialising the tfidf-vector of every each movie.
   * Insert the values inside the model for faster access.
   * @param movies
   */
  static get(movies: Movie[]) {
    const docFreq: Map<string, number> = new Map();

    const itemVectors: ItemVectorsProps[] = [];
    movies.forEach((m) => {
      const { tags } = m;
      const work: Map<string, number> = new Map();
      tags.forEach((tag) => {
        if (work.has(tag)) {
          const workCount = work.get(tag)!;
          work.set(tag, workCount + 1);
        } else {
          work.set(tag, 1);
          if (docFreq.has(tag)) {
            const docTermFrequencies = docFreq.get(tag)!;
            docFreq.set(tag, docTermFrequencies + 1);
          } else {
            docFreq.set(tag, 1);
          }
        }
      });
      itemVectors.push({
        movie: m,
        frequencies: work,
      });
    });

    const logN = Math.log(movies.length);
    for (const [tag, frequency] of docFreq) {
      docFreq.set(tag, logN - Math.log(frequency));
    }

    const modelData: ItemVectorsProps[] = [];
    itemVectors.forEach((e) => {
      const { movie, frequencies } = e;

      let sum = 0;
      for (const [docTag, docTagFrequencies] of frequencies) {
        const idfValue = docFreq.get(docTag);
        if (idfValue) {
          const mult = idfValue * docTagFrequencies;
          sum += Math.pow(mult, 2);
          frequencies.set(docTag, mult);
        }
      }

      const sqrRoot = Math.sqrt(sum);
      for (const [docTag, docTagFrequencies] of frequencies) {
        const idfValue = docFreq.get(docTag);
        if (idfValue) {
          frequencies.set(docTag, docTagFrequencies / sqrRoot);
        }
      }
      modelData.push({ movie, frequencies });
    });

    return new CBFModel(modelData);
  }
}
