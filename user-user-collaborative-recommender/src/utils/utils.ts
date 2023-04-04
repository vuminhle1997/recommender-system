import {Rating} from "../services/interface";

export const meanByVectors = (ratings: Rating[]) => ratings.map(r => r.score).reduce((a, i) => a + i) / ratings.length;

export const dotProduct = (a: Rating[], b: Rating[]) => {
    let sum = 0;
    if (a.length > b.length) {
        for (const rating of a) {
            const bRating = b.find(r => r.movieId == rating.movieId)
            if (bRating) {
                sum += bRating.score * rating.score;
            } else {
                sum += rating.score * 0;
            }
        }
    } else {
        for (const rating of b) {
            const aRating = a.find(r => r.movieId == rating.movieId);
            if (aRating) {
                sum += aRating.score * rating.score;
            } else {
                sum += rating.score * 0;
            }
        }
    }
    return sum;
}

export const euclideanNorm = (ratings: Rating[]) => {
    return Math.sqrt(ratings.map(r => Math.pow(r.score, 2)).reduce((a, i) => a + i))
}