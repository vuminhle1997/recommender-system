import {CBFModel} from "./CBFModel";
import {Rating} from "../interface";
import {meanByVectors} from "../../utils/utils";

export class CBFUserProfileBuilder {
    private model: CBFModel;
    constructor(model: CBFModel) {
        this.model = model;
    }

    /**
     * Creates a preference vector of terms by the given user ratings.
     * @param ratings
     */
    makeUserProfile(ratings: Rating[]) {
        const profilePreferences: Map<string, number> = new Map();
        const avgRatingScore = meanByVectors(ratings);

        ratings.forEach((r) => {
            const { movieId, score } = r;
            const itemProps = this.model.getItemVector(({movieId, title: '', genre: '', tags: []}))
            if (itemProps) {
                for (const [tag, tagWeight] of itemProps.frequencies) {
                    const weight = (score - avgRatingScore) * tagWeight;
                    if (profilePreferences.has(tag)) {
                        const value = profilePreferences.get(tag)!;
                        profilePreferences.set(tag, value + weight);
                    } else {
                        profilePreferences.set(tag, weight);
                    }
                }
            }
        });

        return profilePreferences;
    }
}