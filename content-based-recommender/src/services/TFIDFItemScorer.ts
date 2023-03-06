class TFIDFItemScorer {
  static scoreWithDetails(
    movies: string[][],
    ratingsOfUser: Map<string, number>,
    model: Map<number, Map<string, number>>
  ) {
    const scores: { id: string; score: number }[] = [];
    // DO cosine similarity
    movies.forEach((movie) => {
      const iv = model.get(Number(movie[0]));
      if (iv) {
        let numerator = 0;
        let qiSqrSum = 0;
        let piSqrSum = 0;
        for (const [key, q] of iv) {
          const p = ratingsOfUser.get(key);
          if (p) {
            numerator += q * p;
          }
          qiSqrSum += Math.pow(q, 2);
        }
        for (const [k, val] of ratingsOfUser) {
          piSqrSum += Math.pow(val, 2);
        }

        const denominator = Math.sqrt(piSqrSum) * Math.sqrt(qiSqrSum);
        if (denominator > 0) {
          const r = {
            id: movie[0],
            score: numerator / denominator,
          };
          scores.push(r);
        }
      }
    });

    const sorted = scores.sort((a, b) => {
      if (a.score < b.score) return 1;
      else if (a.score > b.score) return -1;
      else return 0;
    });
    return sorted;
  }
}

export default TFIDFItemScorer;
