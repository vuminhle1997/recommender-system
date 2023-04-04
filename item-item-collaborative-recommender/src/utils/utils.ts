import {Rating} from "../services/interface";

/**
 * Calculate the mean value score by the given ratings.
 * @param ratings
 */
export const meanByVectors = (ratings: Rating[]) => ratings.map(r => r.score).reduce((a, i) => a + i) / ratings.length;

/**
 * Calculates the dot product by the vector "a" and "b".
 * The function only sums the dot terms if the rated user has rated in the other list (user "u" has also rated in item "i" and "j").
 * @param a - Rating[] of item i
 * @param b - Rating[] of item j
 */
export const dotProduct = (a: Rating[], b: Rating[]) => {
    let sum = 0;
    if (a.length > b.length) {
        for (const rating of a) {
            const bRating = b.find(r => r.userId == rating.userId)
            if (bRating) {
                sum += bRating.score * rating.score;
            } else {
                sum += rating.score * 0;
            }
        }
    } else {
        for (const rating of b) {
            const aRating = a.find(r => r.userId == rating.userId);
            if (aRating) {
                sum += aRating.score * rating.score;
            } else {
                sum += rating.score * 0;
            }
        }
    }
    return sum;
}

/**
 * Calculates the euclidean norm of the given ratings.
 * @param ratings
 */
export const euclideanNorm = (ratings: Rating[]) => {
    return Math.sqrt(ratings.map(r => Math.pow(r.score, 2)).reduce((a, i) => a + i))
}