export class ContentBasedRecommender {
  private items: any[][];
  private modelData: Map<number, Map<string, number>>;
  constructor(items: any[][]) {
    this.items = items;
    this.modelData = new Map();
    this.initializeModel();
  }

  initializeModel() {
    const docFreq: Map<string, number> = new Map();

    const itemVectors: Map<number, Map<string, number>> = new Map();
    for (const item of this.items) {
      const work: Map<string, number> = new Map();
      if (item[3]) {
        const array: string[] = [
          ...item[3].map((t: string) => t.toLowerCase()),
          ...item[2].split('|').map((genre: string) => genre.toLowerCase()),
        ];
        const tags = [...new Set(array)];
        for (const tag of tags) {
          if (work.has(tag)) {
            work.set(tag, work.get(tag)! + 1);
          } else {
            work.set(tag, 1);
            if (docFreq.has(tag)) {
              docFreq.set(tag, docFreq.get(tag)! + 1);
            } else {
              docFreq.set(tag, 1);
            }
          }
        }
      }
      itemVectors.set(Number(item[0]), work);
    }

    const logN = Math.log(this.items.length);
    for (const [key, value] of docFreq) {
      docFreq.set(key, logN - Math.log(value));
    }

    const modelData: Map<number, Map<string, number>> = new Map();
    for (const [key, tv] of itemVectors) {
      let sum = 0;
      for (const [k, v] of tv) {
        const val = v * docFreq.get(k)!;
        sum += val * val;
        tv.set(k, val);
      }

      const sqrRoot = Math.sqrt(sum);
      for (const [k, v] of tv) {
        tv.set(k, v / sqrRoot);
      }
      modelData.set(key, tv);
    }
    this.modelData = modelData;
  }

  get getModelData() {
    return this.modelData;
  }
}

export default ContentBasedRecommender;
