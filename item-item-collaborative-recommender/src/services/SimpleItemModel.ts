import { Rating} from "./interface";

export class SimpleItemModel {
    private readonly itemMeans: Map<number, number>;
    private readonly neighborhoods: Map<number, Map<number, number>>;
    private readonly allRatings: Rating[];

    constructor(itemMeans: Map<number, number>, neighborhoods: Map<number, Map<number, number>>, ratings: Rating[]) {
        this.itemMeans = itemMeans;
        this.neighborhoods = neighborhoods;
        this.allRatings = ratings;
    }

    /**
     * Returns the means of every item.
     */
    get getItemMeans() {
        return this.itemMeans;
    }

    /**
     * Get a set of candidates/neighbors of the movie.
     * @param movieItem
     */
    getNeighbors(movieItem: number) {
        const map = this.neighborhoods.get(movieItem);
        if (map) return map;
        else return new Map<number, number>();
    }

    /**
     * Get the ratings of a specific user.
     * @param user
     */
    getUserRatings(user: number) {
        return this.allRatings.filter((r) => r.userId === user);
    }
}