export default class DbClient2 {
  private connectionPromise: Promise<boolean> | null;

  constructor() {
    this.connectionPromise = null;
  }

  private async connect() {
    console.log("isConnected1: ",this.connectionPromise);
    if (!this.connectionPromise) {
      this.connectionPromise = this.connectToDatabase(); // stub
    }
    console.log("isConnected2: ",this.connectionPromise);
    return this.connectionPromise;
  }

  public async getRecord(recordId: string) {
    console.log("prepare conect...", recordId);
    const isConnected =  await this.connect();
    console.log("conected", recordId, isConnected);
    return this.getRecordFromDatabase(recordId); // stub
  }

  private async connectToDatabase() {
    return new Promise<boolean>((resolve, _) => {
      console.log("prepare connectToDatabase");
      setTimeout(() => {
        console.log("connectToDatabased: ", new Date().valueOf());
        resolve(true);
      });
    });
  }

  private getRecordFromDatabase(recordId: string) {
    console.log(
      `getRecordFromDatabase ${recordId}: `,
      new Date().valueOf()
    );
    return { data: recordId };
  }
}