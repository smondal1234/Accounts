const Config = {
    FILE_TRANSFORM_STARTING_EVENT: "FILE_TRANSFORM_STARTING_EVENT",
    FILE_TRANSFORM_COMPLETED: "FILE_TRANSFORM_COMPLETED",
    FILE_TRANSFORM_ERROR: "FILE_TRANSFORM_ERROR",
    FILE_TRANSFORM_ERROR_DISMISS:"FILE_TRANSFORM_ERROR_DISMISS",
    CUSTOMER_ID_TRANSFORM_ERROR: "CUSTOMER_ID_TRANSFORM_ERROR",
    ACCOUNT_DETAILS_COPY_STARTING: "ACCOUNT_DETAILS_COPY_STARTING",
    ACCOUNT_DETAILS_COPY_ERROR: "ACCOUNT_DETAILS_COPY_ERROR",
    ACCOUNT_DETAILS_COPY_FETCH_COMPLETED: "ACCOUNT_DETAILS_COPY_FETCH_COMPLETED",
    XLS_MAX_ROW_COUNT: 65536,
    THREE_LETTER_MONTHS: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    SEVEN_COLUMN_FILE_HEADER: ["Date", "Narration", "Value Dat", "Debit Amount", "Credit Amount", "Chq/Ref Number", "Closing Balance"],
    FOUR_COLUMN_FILE_HEADER: ["date", "transaction", "amount", "type"],
    SAMPLE_FORMAT_ONE: ",,,,,,\n" +
        "  Date     ,Narration                                                                                                                ,Value Dat,Debit Amount       ,Credit Amount      ,Chq/Ref Number   ,Closing Balance\n" +
        "17/04/19,Some Narration 1,17/04/19,9999.99,0,0000000000000123,18560.13\n" +
        "22/04/19,Some Narration 2,22/04/19,,9999.99,0000000001234567,18560.13",
    SAMPLE_FORMAT_TWO: "date,transaction,amount,type\n" +
        "09/03/2019,Some Narration,9.84,Cr",
    DOWNLOAD_SAMPLE: `HDFC_File_ID,Account_Number,Account_Name
    11111532,50729470101857,First Name Last Name
    1111151,00172947010185,First Name Last Name 
    11111906,50729470101157,First Name Last Name
    111119,00147294701012,First Name Last Name
    11111904,50729470101144,First Name Last Name
    1111148,00172947010119,First Name Prakash Last Name
    1111168,50172947010181,First Name Last Name
    1111169,00172947010130,First Name Last Name
    11111764,00729470101140,First Name Last Name
    1111172,00172947010143,First Name Last Name
    11111025,00729470101582,First Name Last Name
    11111528,00729470101383,First Name Last Name
    11111997,00729470101548,First Name Last Name
    1111104,00172947010112,First Name Last Name
    1111127,00172947010101,First Name Last Name
    `

};
export default Config;
