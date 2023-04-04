import {Rating} from "../services/interface";

/**
 * Calculates the mean value by the parameter ratings as a list of <Rating>
 * @param ratings
 */
export const meanByVectors = (ratings: Rating[]) => ratings.map(r => r.score).reduce((a, i) => a + i) / ratings.length;