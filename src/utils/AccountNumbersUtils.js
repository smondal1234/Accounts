import Dexie from "dexie";
import { accDetailsStatus, onAccountsFetched } from "../actions/AccountStatementAction";
import store from '../store'
import Config from "./Config";
import PromisifyFileReader from 'promisify-file-reader';

const db = new Dexie('AccountNumbersDatabase');
db.version(1).stores({
    accountDetails: 'fileId, accountNumber, accountName'
});

export default class AccountNumbersUtils {
    static parseFile = async (FileObject) => {
        store.dispatch(accDetailsStatus({type: Config.ACCOUNT_DETAILS_COPY_STARTING}));
        let lines = (await PromisifyFileReader.readAsText(FileObject)).split("\n");
        let accounts = [];
        AccountNumbersUtils.initDB().clear();
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i];
            try {
                let account = await AccountNumbersUtils.saveLineToStorageUtils(line);
                if (account)
                    accounts.push(account);
            } catch (err) {
                store.dispatch(accDetailsStatus({type: Config.ACCOUNT_DETAILS_COPY_ERROR, err}));
                throw err;
            }
        }
        console.log("in parseFile, the object saved is \n\n" + JSON.stringify(accounts));
        store.dispatch(onAccountsFetched(accounts));
        
    }

    static saveLineToStorageUtils = async (line) => {
        if (!line || !line.trim()) return;
        let lineParts = line.split(",").map(linePart => linePart.trim());
        let objectToStore = {
            fileId: lineParts[0],
            accountNumber: lineParts[1],
            accountName: lineParts[2]
        };
        console.log("in AccountNumbersUtils.saveLineToStorageUtils, about to save: \n\n" + JSON.stringify(objectToStore));
        await AccountNumbersUtils.initDB().add(objectToStore);
        return objectToStore;
    };

    static initDB = () => {
        return db.accountDetails;
    };

    static getAccountDetails = async (fileId) => await AccountNumbersUtils.initDB().where("fileId").equals(fileId).toArray();
    
    static getAllAccountDetails = async () => {
        let accounts = (await AccountNumbersUtils.initDB().toArray());
        return accounts;
    };
}