export default class DbClient {
  private isConnected: boolean;

  constructor() {
    this.isConnected = false;
  }

  private async connect() {
    if (this.isConnected) {
      return;
    }
    console.log("isConnected1: ",this.isConnected);
    await this.connectToDatabase(); // stub
    this.isConnected = true;
    console.log("isConnected2: ",this.isConnected);
  }

  public async getRecord(recordId: string) {
    console.log("prepare conect...", recordId);
    await this.connect();
    console.log("conected", recordId);
    return this.getRecordFromDatabase(recordId); // stub
  }

  private async connectToDatabase() {
    return new Promise((resolve, _) => {
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
