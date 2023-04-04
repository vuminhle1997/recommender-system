import {CBFModel} from "./CBFModel";
import {CBFUserProfileBuilder} from "./CBFUserProfileBuilder";
import {DAOContainer} from "./DAOContainer";
import {Movie} from "../interface";

export class CBFRecommender {
    private readonly daoContainer: DAOContainer;
    private readonly model: CBFModel;
    private readonly profileBuilder: CBFUserProfileBuilder;

    constructor(daoContainer: DAOContainer, model: CBFModel) {
        this.daoContainer = daoContainer;
        this.model = model;
        this.profileBuilder = new CBFUserProfileBuilder(model);
    }

    /**
     * Makes a score prediction for each selected movie by multiplying the preference vector
     * of the user and the tfidf-vector of the iterated movie.
     * @return Score[]
     * @param user
     * @param movies
     */
    scoreWithDetails(user: number, movies: Movie[]) {
        const ratings = this.daoContainer.ratings.filter((r) => r.userId === user);

        if (!ratings) {
            return [];
        }

        const results: ({ movie: Movie; score: number })[] = [];
        const userPreferences = this.profileBuilder.makeUserProfile(ratings);
        movies.forEach((m) => {
            const itemVectorProps = this.model.getItemVector(m)
            const {frequencies} = itemVectorProps
            let numerator = 0, piSqrSum = 0, qiSqrSum = 0;
            for (const [tag, q] of frequencies) {
                const p = userPreferences.get(tag);
                if (p) {
                    numerator += p * q;
                }
                qiSqrSum += Math.pow(q, 2);
            }
            for (const tagScore of userPreferences.values()) {
                piSqrSum += Math.pow(tagScore, 2);
            }
            const denominator = Math.sqrt(piSqrSum) * Math.sqrt(qiSqrSum);
            if (denominator > 0) {
                const score = numerator / denominator;
                results.push(({movie: m, score}))
            }
        });

        const sorted = results.sort((a, b) => b.score - a.score);
        return sorted;
    }
}