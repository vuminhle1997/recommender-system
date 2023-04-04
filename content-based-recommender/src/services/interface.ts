export interface ItemVectorsProps {
  movie: Movie;
  frequencies: Map<string, number>;
}

export class Rating {
  public score: number;
  public movieId: number;
  public userId: number;

  constructor(movieId: number, userId: number, score: number) {
    this.score = score;
    this.userId = userId;
    this.movieId = movieId;
  }
}

export class Movie {
  public movieId: number;
  public title: string;
  public genre: string;
  public tags: string[];

  constructor(movieId: number, title: string, genre: string, tags: string[] = []) {
    this.movieId = movieId;
    this.title = title;
    this.genre = genre;
    this.tags = tags;
  }
}
