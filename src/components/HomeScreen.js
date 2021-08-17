import React, { Fragment, createRef } from "react";
import { Button, DropdownButton, Dropdown } from 'react-bootstrap'
import {FilePicker} from 'react-file-picker'
import Config from "../utils/Config";
import { userDetailsClear, showStateToFalse, convertButtonClick, accDetailsStatus, onAccountsFetched} from '../actions/AccountStatementAction'
import { connect } from "react-redux";
import Dropzone from 'react-dropzone'
import RJSlogo from '../assets/rjs-logo.png'
import { bindActionCreators } from "redux";
import XLSCSVFileTransformer from "../utils/XLSCSVFileTransformer";
import AccountNumbersUtils from "../utils/AccountNumbersUtils";
import Utils from "../utils/utils";

 class HomeScreen extends React.Component {
    state ={
        customerId : "Select",
        file : []
    }
    textInput = createRef()
    
    convertHandle = async () => {
        await this.props.convertButtonClick();
        this.textInput.current.click();
    }
    
    handleChange = (event) => {
        this.setState({customerId : event});
    }

    componentDidMount = () => {
        AccountNumbersUtils.getAllAccountDetails().then((accounts) => {
            if (Utils.isArray(accounts) && accounts.length > 0)
                this.props.onAccountsFetched(accounts);
        }).catch(() => null);
    }

    componentDidUpdate = () => {
        if (this.props.accountStatement.customerIdError) {
            let btnDisable = document.querySelector("#modalBtn");
            this.state.customerId === "Select" ? btnDisable.disabled = true : btnDisable.disabled = false;
        }
    }

     renderHeader = () => {
         return (
             <Fragment>
                 <nav className="navbar navbar-expand-sm mt-2">
                     <div className="container">
                         <a href="https://rjs.in" target="_blank" className="navbar-brand text-dark"><img src={RJSlogo} alt="RJS" width="25" className="mr-2" /> HDFC Statement Converter</a>
                         <button className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
                             <div className="icon mt-1"></div>
                             <div className="icon my-1"></div>
                             <div className="icon my-1"></div>
                         </button>
                         <div className="navbar-collapse collapse" id="navbarCollapse">
                             <ul className="navbar-nav nav-pills ml-auto mt-2">
                                 {this.props.accountStatement.allusers && this.props.accountStatement.allusers.length ? <li className="nav-item"><a onClick={this.convertHandle} className={`nav-link pointer ${this.props.accountStatement.show ? 'active' : ''}`}>Convert</a></li> : ""}
                                 <li className="nav-item dropdown">
                                     <a className="nav-link dropdown-toggle pointer" data-toggle="dropdown">Settings</a>
                                     <div className="dropdown-menu">
                                         {this.props.accountStatement.allusers && this.props.accountStatement.allusers.length ? <Fragment>
                                             {this.props.accountStatement.show && <a onClick={this.props.showStateToFalse} className="dropdown-item p-0 px-2 pointer mb-1">Select Account Name CSV</a>}
                                             <a onClick={this.downloadFormatOne} className="dropdown-item p-0 px-2 pointer">Net Banking Sample</a>
                                             <a onClick={this.downloadFormatTwo} className="dropdown-item p-0 px-2 pointer my-1">Card Statement Sample</a>
                                             <a className="dropdown-item p-0 px-2 pointer" data-toggle="modal" data-target="#clearDataModal">Clear All Data</a>
                                         </Fragment> : <a onClick={this.downloadFormatThree} className="dropdown-item p-0 px-2 pointer">Download Format Sample</a>}

                                     </div>
                                 </li>
                                 <li><a className="nav-item nav-link pointer" href="mailto:info@rjs.in" target="_blank" >Contact</a></li>
                             </ul>
                         </div>
                     </div>
                 </nav>
                 <div className="container">
                     <hr />
                 </div>
             </Fragment>
         )
     }

    render = () => (
        <Fragment>
            {this.renderHeader()}
            <div>
                {this.props.accountStatement.show ?
                    <div>
                        <Dropzone
                            onDrop={this.onFileSelected}
                            onError={errMsg => console.log("error occurred " + errMsg)}
                        >
                            {({ getRootProps, getInputProps }) => (
                                <section>
                                    <div {...getRootProps()} style={{ height: '150px', textAlign: 'center', alignItems: 'center' }} ref={this.textInput}>
                                        <input {...getInputProps()} />
                                        <p className="pt-5">Drag and drop file to convert</p>
                                    </div>
                                </section>
                            )}
                        </Dropzone>


                        {this.getAccountsView()}
                    </div> :
                    <div className="container pt-5">
                        <div className="row align-items-center justify-content-center text-center">
                            {this.props.accountStatement.loading ?
                                <div className="progress rounded-pill" style={{ width: '30%', margin: '50px', height: '40px' }}>
                                    <div className="progress-bar progress-bar-striped progress-bar-animated bg-info" style={{ height: '100%' }}>Loading...</div>
                                </div>
                                :
                                <div>
                                    <FilePicker
                                        onChange={this.onAccountNameFileSelected}
                                        onError={errMsg => console.log("error occurred " + errMsg)}
                                    >
                                    <Button variant="light border-dark p-3 mt-3">
                                        Select Account Name CSV
                                    </Button>
                                    </FilePicker>
                                    <p className="mt-2">{"(Customer ID, Account Number, Name)"}</p>
                                </div>
                            }
                        </div>
                    </div>
                }
            </div>

            {this.renderClearDialogView()}

            {this.renderErrorDialogView()}
            
            {this.props.accountStatement.error
                ?
                <div className="modal-backdrop fade show" />
                : null}
        </Fragment>
    );

    renderErrorDialogView = () => (
        <Fragment>
            <div className={`modal fade ${this.props.accountStatement.error ? "show" : ""}`} style={{
                display: `${this.props.accountStatement.error ? "block" : "none"}`,
            }} id="errorModal">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Error</h3>
                            <button className="close" onClick={this.modalClose} data-dismiss="modal fade" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <h5>
                                {this.props.accountStatement.error}
                            </h5>
                            {this.props.accountStatement.customerIdError ?
                                    <DropdownButton id="dropdown-item-button" onSelect={this.handleChange} title={this.state.customerId}>
                                        {this.props.accountStatement.allusers.map((account, index) => (
                                            <Dropdown.Item as="button" eventKey={account.fileId} key={index}>{account.fileId} - {account.accountName}</Dropdown.Item>
                                        ))}
                                    </DropdownButton>
                                    : null}
                        </div>
                        <div className="modal-footer">
                            {this.props.accountStatement.customerIdError ? <button onClick={this.modalFileSelected} className="btn btn-primary" id="modalBtn" data-dismiss="modal">OK</button>: null}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    ); 
    renderClearDialogView = () => (
        <Fragment>
            <div className="modal fade" id="clearDataModal" >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Clear All Data</h3>
                            <button className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <h5>Are You Sure To Clear All Data ?</h5>
                        </div>
                        <div className="modal-footer">
                            <button onClick={this.clearAllData} className="btn btn-primary" data-dismiss="modal">Clear</button>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );

    getAccountsView = () => !this.props.accountStatement.allusers.length ?
        null
        :
         <div className="container mb-5">
            <div className="row">
             <div className="col-12 mx-auto text-center"> 
                <h5 className="mb-3">
                <strong>Account Mapping</strong>
                </h5>
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Customer ID</th>
                            <th>Account Number</th>
                            <th>Name</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.props.accountStatement.allusers.map((account, index) => (
                                <tr key={index}>
                                        <td> {index + 1} </td>
                                        <td>{account.fileId}</td>
                                        <td>{account.accountNumber}</td>
                                        <td>{account.accountName}</td>
                                    </tr>
                            ))
                        }
                        </tbody>
                    </table>
            </div>
        </div>
    </div>

    clearAllData = () => {
        this.props.userDetailsClear()
    }

    modalClose = () =>{
        this.props.accDetailsStatus({type: Config.FILE_TRANSFORM_ERROR_DISMISS});
    }
     
    modalFileSelected = () => {
        this.modalClose();
        this.setState({ customerId: "Select"});
        if (this.state.file[0])
            this.onFileSelected(this.state.file[0], this.state.customerId);
    }

    downloadFormatOne = () => {
        XLSCSVFileTransformer.downloadTextFile(Config.SAMPLE_FORMAT_ONE, "Net_Banking_Sample.csv");
    };

    downloadFormatTwo = () => {
        XLSCSVFileTransformer.downloadTextFile(Config.SAMPLE_FORMAT_TWO, "Card_Statement_Sample.csv");
    };

    downloadFormatThree = () => {
        XLSCSVFileTransformer.downloadTextFile(Config.DOWNLOAD_SAMPLE, "AccountNames.csv");
    };

    onFileSelected = (FileObjects, customerId = undefined) => {
        this.setState({file : FileObjects});
        if(Utils.isArray(customerId)) customerId = undefined;
        XLSCSVFileTransformer.transformFile(Utils.isArray(FileObjects) ? FileObjects : [FileObjects], customerId).then(() => null).catch(() => null);
    };

    onAccountNameFileSelected = (FileObject) => {
        console.log("The file selected is " + FileObject.name);
        AccountNumbersUtils.parseFile(FileObject);
    };
}

const mapStateToProps = state => ({
    accountStatement: state.accountStatementReducer
})

const mapDispatchToProps = (dispatch) =>
    bindActionCreators({
        userDetailsClear,
        showStateToFalse,
        convertButtonClick,
        onAccountsFetched,
        accDetailsStatus
    }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen)


