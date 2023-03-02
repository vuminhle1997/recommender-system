export class AssociationRecommender {
  private items: Map<string, Array<string[]>>;
  private assocMatrix: Map<string, Map<string, number>>;

  constructor(items: Map<string, Array<string[]>>) {
    this.items = items;
    this.assocMatrix = new Map();
    this.initializeMatrix();
  }

  private initializeMatrix() {
    // const itemUsers: Map<string, Array<string>> = new Map();
    // this.items.forEach((ratings, movieTitle) => {
    //     const users: string[] = [];
    //     ratings.forEach(r => {
    //         const userId = r[r.length-1];
    //         users.push(userId);
    //     });
    //     itemUsers.set(movieTitle, users);
    // });

    // const assocMatrix: Map<string, Map<string, number>> = new Map();
    // for (const [xId, xUsers] of itemUsers) {
    //     const itemScores: Map<string, number> = new Map();
    //     let count: number = 0;
    //     for (const [yId, yUsers] of itemUsers) {
    //         yUsers.forEach(yUserId => {
    //             if (xUsers.includes(yUserId)) {
    //                 count++;
    //             }
    //         });
    //         const numeratorFraction = count;
    //         const denominatorFraction = xUsers.length;
    //         const probability = numeratorFraction / denominatorFraction;
    //         itemScores.set(yId, probability);
    //         count = 0;
    //     }
    //     assocMatrix.set(xId, itemScores);
    // }
    const assocMatrix = new Map<string, Map<string, number>>();
    this.items.forEach((j_ratings, j_movieTitle) => {
      const itemScores = new Map<string, number>();
      this.items.forEach((i_ratings, i_movieTitle) => {
        let i_and_j = 0;
        for (let j = 0; j < j_ratings.length; j++) {
          const jObj = j_ratings[j];
          const j_id = jObj[jObj.length - 1];
          for (let i = 0; i < i_ratings.length; i++) {
            const iObj = i_ratings[i];
            const i_id = iObj[iObj.length - 1];
            if (i_id === j_id) {
              i_and_j++;
            }
          }
        }
        const prob = i_and_j / j_ratings.length;
        itemScores.set(i_movieTitle, prob);
      });
      assocMatrix.set(j_movieTitle, itemScores);
    });
    this.assocMatrix = assocMatrix;
  }

  get getAssociationMatrix() {
    return this.assocMatrix;
  }

  getTopNOfAssociationMatrix(n: number, movieTitle: string) {
    const unsortedRatings = new Array<Map<string, number>>();
    const matrix = this.assocMatrix.get(movieTitle);
    if (matrix) {
      for (const [key, value] of matrix) {
        const rating = new Map<string, number>().set(key, value);
        unsortedRatings.push(rating);
      }
      unsortedRatings.sort((o1, o2) => {
        for (const [key1, value1] of o1) {
          for (const [key2, value2] of o2) {
            if (value1 < value2) return 1;
            if (value1 > value2) return -1;
            if (value1 === value2) return 0;
          }
        }
        return 0;
      });
      return unsortedRatings.slice(0, n);
    } else {
      return [];
    }
  }
}
