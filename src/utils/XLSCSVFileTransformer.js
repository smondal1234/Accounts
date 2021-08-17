
import numeral from "numeral";
import _ from "underscore";
import AccountNumbersUtils from "./AccountNumbersUtils";
import Config from "./Config";
import DateUtils from "./DateUtils";
import Utils from "./utils";
import store from '../store'
import { accDetailsStatus } from "../actions/AccountStatementAction";
import PromisifyFileReader from 'promisify-file-reader';
import * as CSV from 'csv-string';


export default class XLSCSVFileTransformer {
    static transformFile = async (FileObjects, customerId = undefined) => {
        console.log("The files selected are " + FileObjects.map(fileObj => fileObj.name));
        console.log("FileObjects is array? " + Utils.isArray(FileObjects));
        store.dispatch(accDetailsStatus({type: Config.FILE_TRANSFORM_STARTING_EVENT}));
        for (let i = 0; i < FileObjects.length; i++) {
            let FileObject = FileObjects[i];
            let fileId = customerId || FileObject.name.split("_")[0];
            let accountDetails = ((await AccountNumbersUtils.getAccountDetails(fileId)) || [])[0];
            console.log("in transformFile, accountDetails for fileId is " + fileId + " is : \n\n" + JSON.stringify(accountDetails));
            if (Utils.isEmpty(accountDetails)) {
                XLSCSVFileTransformer.onFileTransformationError("No mapping found for Customer ID: " + fileId, Config.CUSTOMER_ID_TRANSFORM_ERROR);
                continue;
            }
    
            let text = (await PromisifyFileReader.readAsText(FileObject));
            if (Utils.isEmpty(text)) {
                XLSCSVFileTransformer.onFileTransformationError("Empty Or Invalid File Selected - " + FileObject.name);
                continue;
            }
    
            let lines =
                (
                    CSV.parse(text)
                    ||
                    []
                )
                    .map(line =>
                        (
                            line
                            ||
                            []
                        )
                            .map(linePart =>
                                (
                                    !Utils.isEmpty(linePart) && linePart.trim()
                                )
                                ||
                                linePart
                            )
                    )
            ;
    
            console.log("lines is " + JSON.stringify(lines));
    
            if (XLSCSVFileTransformer.isBlankFile(lines) || XLSCSVFileTransformer.isInvalidFile(lines)) {
                XLSCSVFileTransformer.onFileTransformationError("Empty Or Invalid File Selected - " + FileObject.name);
                continue;
            }
    
            let csv = [];
    
            let startIndex = XLSCSVFileTransformer.getStartIndex(lines);
    
            try {
                for (let i = startIndex; i < lines.length; i++) {
                    console.log("iterating over line number " + i);
                    XLSCSVFileTransformer.parseLineToCSVModel(csv, lines[i], i + 1);
                }
            } catch (err) {
                console.log("error occured! " + err);
                XLSCSVFileTransformer.onFileTransformationError("Error parsing file \"" + FileObject.name + "\" - \n\n" + err.message);          
                continue;
            }
    
            console.log("the csv is now :\n\n" + csv.join("\n"));
    
            csv[2] = "Account No          : " + accountDetails.accountNumber + ",,,,,,";
            csv[3] = "Customer Name       : " + accountDetails.accountName + ",,,,,,";
            csv[9] = "Total Debit Count   : " + csv[9] + ",,,,,,";
            csv[10] = "Total Credit Count  : " + csv[10] + ",,,,,,";
            csv[11] = "Total Debit Amount  : " + csv[11].toFixed(2) + ",,,,,,";
            csv[12] = "Total Credit Amount : " + csv[12].toFixed(2) + ",,,,,,";
            csv.push(",,,,,,");
            csv.push("\"\t\",,,,,,");
    
    
            let finalCsv = csv.join("\n");
            console.log("The transformed CSV is: \n\n" + finalCsv);
            XLSCSVFileTransformer.onFileTransformationComplete({
                filename: accountDetails.accountNumber + "_" + DateUtils.formatForFileName() + ".csv",
                finalCsv
            });
        }
    };

    static onFileTransformationComplete = (data) => {
        store.dispatch(accDetailsStatus({type: Config.FILE_TRANSFORM_COMPLETED}));
        XLSCSVFileTransformer.downloadTextFile(data.finalCsv, data.filename);
    };
    
    static onFileTransformationError = (err, errType) => {
        store.dispatch(accDetailsStatus({type: errType || Config.FILE_TRANSFORM_ERROR, err}));
        console.log(err);
    }

    static isInvalidFile = (lines) => {
        let startIndex = XLSCSVFileTransformer.getStartIndex(lines);
        let headerLine = lines[startIndex - 1];
        return !(_.isEqual(headerLine, Config.SEVEN_COLUMN_FILE_HEADER) || _.isEqual(headerLine, Config.FOUR_COLUMN_FILE_HEADER))
    };

    static isBlankFile = (lines) => {
        if (Utils.isEmpty(lines)) return true;
        let startIndex = XLSCSVFileTransformer.getStartIndex(lines);
        console.log("in isBlankFile, startIndex is " + startIndex);
        let dataSet = lines.slice(startIndex);
        console.log("in isBlankFile, dataSet is " + JSON.stringify(dataSet));
        let result = dataSet.every(line => {
            console.log("in isBlankFile, line is " + JSON.stringify(line));
            let isLineEmpty = Utils.isEmpty(line);
            let areLineDatasEmpty = line.every(data => {
                console.log("in isBlankFile, data isEmpty? " + Utils.isEmpty(data));
                return Utils.isEmpty(data)
            });
            console.log("in isBlankFile, areLineDatasEmpty is: " + areLineDatasEmpty);
            console.log("in isBlankFile,  isLineEmpty || areLineDatasEmpty is: " + isLineEmpty || areLineDatasEmpty);
            return isLineEmpty || areLineDatasEmpty;
        });
        console.log("in isBlankFile, returning: " + result);
        return result;
    };

    static is7ColumnFile = (lines) => (lines || []).some(XLSCSVFileTransformer.is7ColumnLine);

    static getStartIndex = (lines) => XLSCSVFileTransformer.is7ColumnFile(lines) ? 2 : 1;

    static is7ColumnLine = (lineParts) => !Utils.isEmpty(numeral(lineParts[lineParts.length - 1]).value());

    static parseLineToCSVModel = (csv, lineParts, lineNumber) => {
        if (Utils.isEmpty(lineParts) || lineParts.every(linePart => Utils.isEmpty(linePart))) {
            console.log("lineNumber " + (lineNumber + 1) + " is empty, returning");
            return;
        }
        if (XLSCSVFileTransformer.is7ColumnLine(lineParts)) {
            XLSCSVFileTransformer.parseLineToCSVModel7Column(csv, lineParts, lineNumber);
        } else {
            XLSCSVFileTransformer.parseLineToCSVModel4Column(csv, lineParts, lineNumber);
        }
    };

    static parseLineToCSVModel7Column = (csv, lineParts, lineNumber) => {
        let isDebitTransaction = numeral(lineParts[lineParts.length - 4]).value() > numeral(lineParts[lineParts.length - 3]).value();
        if (lineNumber === 3) {
            csv.push("Statement of Account,,,,,,");
            csv.push(",,,,,,");
            csv.push("Account No          : ,,,,,,");
            csv.push("Customer Name       : ,,,,,,");
            csv.push("Currency            : INR,,,,,,");
            csv.push("Opening Balance     : " + (Number(numeral(lineParts[lineParts.length - 1]).value()) + Number(isDebitTransaction ? numeral(lineParts[lineParts.length - 4]).value() : 0 - numeral(lineParts[lineParts.length - 3]).value())).toFixed(2) + ",,,,,,");
            csv.push(",,,,,,");
            csv.push("From Date           : " + DateUtils.formatForCSV(lineParts[0]) + ",,,,,,");
            csv.push("");
            csv.push(Number(numeral(0).value()));
            csv.push(Number(numeral(0).value()));
            csv.push(Number(numeral(0).value()));
            csv.push(Number(numeral(0).value()));
            csv.push(",,,,,,");
            csv.push(",,,,,,");
            csv.push(",,,,,,");
            csv.push("Transaction Date,Description,Amount,C.D.Flag,Reference No,Value Date,Branch Name")
        }

        csv[6] = "Closing Balance     : " + Number(numeral(lineParts[lineParts.length - 1]).value()).toFixed(2) + ",,,,,,";
        csv[8] = "To Date             : " + DateUtils.formatForCSV(lineParts[0]) + ",,,,,,";
        csv[9] += isDebitTransaction ? 1 : 0;
        csv[10] += isDebitTransaction ? 0 : 1;
        csv[11] += isDebitTransaction ? Number(numeral(lineParts[lineParts.length - 4]).value()) : 0;
        csv[12] += isDebitTransaction ? 0 : Number(numeral(lineParts[lineParts.length - 3]).value());

        csv.push([lineParts[0] + " 0:00", "\"" + lineParts.slice(1, lineParts.length - 5).join(",") + "\"", Number(numeral(isDebitTransaction ? lineParts[lineParts.length - 4] : lineParts[lineParts.length - 3]).value()).toFixed(2), isDebitTransaction ? "D" : "C", lineParts[lineParts.length - 2], lineParts[lineParts.length - 5] + " 0:00", "X"].join(","));

    };

    static parseLineToCSVModel4Column = (csv, lineParts, lineNumber) => {
        let isDebitTransaction = !(lineParts[lineParts.length - 1] === "Cr");
        console.log("in XLSCSVFileTransformer.parseLineToCSVModel4Column, isDebitTransaction is " + isDebitTransaction + " lineNumber is " + lineNumber);
        if (lineNumber === 2) {
            console.log("in XLSCSVFileTransformer.parseLineToCSVModel4Column, adding all the stuff for line 2");
            csv.push("Statement of Account,,,,,,");
            csv.push(",,,,,,");
            csv.push("Account No          : ,,,,,,");
            csv.push("Customer Name       : ,,,,,,");
            csv.push("Currency            : INR,,,,,,");
            csv.push("Opening Balance     : 0,,,,,,");
            csv.push("Closing Balance     : 0,,,,,,");
            csv.push("From Date           : " + DateUtils.formatForCSV(lineParts[0]) + ",,,,,,");
            csv.push("");
            csv.push(Number(numeral(0).value()));
            csv.push(Number(numeral(0).value()));
            csv.push(Number(numeral(0).value()));
            csv.push(Number(numeral(0).value()));
            csv.push(",,,,,,");
            csv.push(",,,,,,");
            csv.push(",,,,,,");
            csv.push("Transaction Date,Description,Amount,C.D.Flag,Reference No,Value Date,Branch Name")
        }

        csv[8] = "To Date             : " + DateUtils.formatForCSV(lineParts[0]) + ",,,,,,";
        csv[9] = isDebitTransaction ? ++csv[9] : csv[9];
        csv[10] = isDebitTransaction ? csv[10] : ++csv[10];
        csv[11] += isDebitTransaction ? Number(numeral(lineParts[lineParts.length - 2]).value()) : Number(numeral(0).value());
        csv[12] += isDebitTransaction ? Number(numeral(0).value()) : Number(numeral(lineParts[lineParts.length - 2]).value());

        csv.push([lineParts[0] + " 0:00", "\"" + lineParts.slice(1, lineParts.length - 2).join(",") + "\"", Number(numeral(lineParts[lineParts.length - 2]).value()).toFixed(2), isDebitTransaction ? "D" : "C", "X", lineParts[0] + " 0:00", "X"].join(","));

    };

    static downloadTextFile = (filedata, filename) => {
        const element = document.createElement("a");
        const file = new Blob([filedata], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
    };
}




