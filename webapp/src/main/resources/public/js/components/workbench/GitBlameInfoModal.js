import PropTypes from 'prop-types';
import React from "react";
import {FormattedMessage, injectIntl} from "react-intl";
import {Button, Modal} from "react-bootstrap";
import {withAppConfig} from "../../utils/AppConfig";


let GitBlameInfoModal = React.createClass({

    propTypes() {
        return {
            "show": PropTypes.bool.isRequired,
            "textUnit": PropTypes.object.isRequired,
            "gitBlameWithUsage": PropTypes.object.isRequired
        };
    },

    getDefaultProps() {
        return {
            "show": false,
            "textUnit": null,
            "gitBlameWithUsage": null
        };
    },

    /**
     * @returns {string} The title of the modal is the name of the text unit
     */
    getTitle() {
        return this.props.textUnit == null ? "" : this.props.intl.formatMessage({ id: "workbench.gitBlameModal.info" });
    },

    /**
     * @param label  The label for the data to display
     * @param data   The data to display
     * @returns {*}  The row of label:data to display in the modal
     */
    displayInfo(label, data) {
        let gitBlameClass = "";
        if (data == null) {
            gitBlameClass = " git-blame-unused";
            data = "-";
        }

        return (
            <div className={"row git-blame"}>
                <label className={"col-sm-3 git-blame-label"}>{label}</label>
                <div className={"col-sm-9 git-blame-info" + gitBlameClass}>{data}</div>
            </div>
        );
    },

    /**
     * @param labelId  The labelId for the formatted message
     * @param data     The data to display
     * @returns {*}    The row of label:data to display in the modal
     */
    displayInfoWithId(labelId, data) {
        return this.displayInfo(this.props.intl.formatMessage({ id: labelId }), data);
    },

    /**
     * @returns {*} Generates the content for the text unit information section
     */
    renderTextUnitInfo() {
        return this.props.textUnit === null ? "" :
            (
                <div>
                    {this.displayInfoWithId("textUnit.gitBlameModal.repository", this.props.textUnit.getRepositoryName())}
                    {this.displayInfoWithId("textUnit.gitBlameModal.assetPath", this.props.textUnit.getAssetPath())}
                    {this.displayInfoWithId("textUnit.gitBlameModal.id", this.props.textUnit.getName())}
                    {this.displayInfoWithId("textUnit.gitBlameModal.source", this.props.textUnit.getSource())}
                    {this.displayInfoWithId("textUnit.gitBlameModal.target", this.props.textUnit.getTarget())}
                    {this.displayInfoWithId("textUnit.gitBlameModal.locale", this.props.textUnit.getTargetLocale())}
                    {this.displayInfoWithId("textUnit.gitBlameModal.created", this.convertDateTime(this.props.textUnit.getTmTextUnitCreatedDate()))}
                    {this.displayInfoWithId("textUnit.gitBlameModal.translated", this.convertDateTime(this.props.textUnit.getCreatedDate()))}
                    {this.displayInfoWithId("textUnit.gitBlameModal.pluralForm", this.props.textUnit.getPluralForm())}
                    {this.displayInfoWithId("textUnit.gitBlameModal.pluralFormOther", this.props.textUnit.getPluralFormOther())}
                    {this.displayInfoWithId("textUnit.gitBlameModal.comment", this.props.textUnit.getComment())}
                    {this.displayInfoWithId("textUnit.gitBlameModal.targetComment", this.props.textUnit.getTargetComment())}
                </div>
            );
    },

    /**
     * @returns {*} Generates the content for the git blame information section
     */
    renderGitBlameInfo() {
        return (
            <div>
                {this.displayInfoWithId("textUnit.gitBlameModal.authorName", this.getAuthorName())}
                {this.displayInfoWithId("textUnit.gitBlameModal.authorEmail", this.getAuthorEmail())}
                {this.displayInfoWithId("textUnit.gitBlameModal.commit", this.getCommitName())}
                {this.displayInfoWithId("textUnit.gitBlameModal.commitDate", this.convertDateTime(this.getCommitTime()))}
                {this.displayInfoWithId("textUnit.gitBlameModal.location", this.getLocation())}
            </div>
        )
    },

    /**
     * @returns {*} Generates the content for the debug section (additional text unit information)
     */
    renderDebugInfo() {
        return this.props.textUnit === null ? "" :
             (
                <div className="panel-body">
                    {this.displayInfo("TmTextUnitId", this.props.textUnit.getTmTextUnitId())}
                    {this.displayInfo("TmTextUnitVariantId", this.props.textUnit.getTmTextUnitVariantId())}
                    {this.displayInfo("TmTextUnitCurrentVariantId", this.props.textUnit.getTmTextUnitCurrentVariantId())}
                    {this.displayInfo("AssetTextUnitId", this.props.textUnit.getAssetId())}
                    {this.displayInfo("LastSuccessfulAsset\nExtractionId", this.props.textUnit.getLastSuccessfulAssetExtractionId())}
                    {this.displayInfo("AssetExtractionId", this.props.textUnit.getAssetExtractionId())}
                </div>
            );
    },

    /**
     * @param property The property of the GitBlame object to retrieve
     * @returns {*}    The value of the given property of the GitBlame object
     */
    getGitBlameProperty(property) {
        let value = null;
        if (this.props.gitBlameWithUsage != null && this.props.gitBlameWithUsage["gitBlame"] != null)
            value = this.props.gitBlameWithUsage["gitBlame"][property];
        return value;
    },

    /**
     * @returns {str} The code author of the current text unit
     */
    getAuthorName() {
        return this.getGitBlameProperty("authorName");
    },

    /**
     * @returns {str} The email of the code author of the current text unit
     */
    getAuthorEmail() {
        return this.getGitBlameProperty("authorEmail");
    },

    /**
     * @returns {str} The commit name of the current text unit
     */
    getCommitName() {
        return this.getGitBlameProperty("commitName");
    },

    /**
     * @returns {int} The commit time (in ms) of the current text unit
     */
    getCommitTime() {
        return parseInt(this.getGitBlameProperty("commitTime")) * 1000;
    },

    /**
     * @returns {*} A list of usages of the current text unit, or null if there are none
     */
    getUsages() {
        if (this.props.gitBlameWithUsage == null || this.props.gitBlameWithUsage["usages"] == null)
            return null;
        return this.props.gitBlameWithUsage["usages"];
    },

    /**
     * @returns {*} Converts the list of usages of the text unit to a list of links to given text unit
     */
    getLocation() {
        let textUnit = this.props.textUnit;
        let usages = this.getUsages();

        if (textUnit == null || usages == null) {
            return null;
        }

        if (usages.length === 0) {
            usages = [textUnit.getAssetPath()];
        }

        let links = usages.join('\n');

        if (this.props.appConfig.opengrok.server !== null) {
            links = this.getOpenGrokLinks(usages);
        }

        return links;
    },

    getOpenGrokLinks(usages) {
        let repo = this.props.textUnit.getRepositoryName();
        let links = [];
        for (let usage of usages) {
            usage = usage.replace(this.props.appConfig.opengrok.extractedFilePrefix, "");
            let link = this.props.appConfig.opengrok.server;
            for (let repoKey in this.props.appConfig.opengrok.repositoryMapping){
                if (repo === repoKey) {
                    link += this.props.appConfig.opengrok.repositoryMapping[repoKey];
                    break;
                }
            }
            link += usage.replace(":", "#");
            links.push(<div key={usage}><a href={link}>{usage}</a></div>);
        }
        return links;
    },

    /**
     * @param date   An integer representing a datetime
     * @returns {*}  Human readable version of the given datetime
     *
     */
    convertDateTime(date) {
        if (date === null || isNaN(date)) {
            return null;
        }

        let options = {year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric'};
        return (this.props.intl.formatDate(date, options));
    },

    /**
     * Closes the modal and calls the parent action handler to mark the modal as closed
     */
    closeModal() {
        this.props.onCloseModal();
    },

    render() {
        return (
            <Modal className={"git-blame-modal"} show={this.props.show} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.getTitle()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className={"row"}>
                        <div className={"col-sm-4"}><h4><FormattedMessage id={"textUnit.gitBlameModal.textUnit"}/></h4></div>
                    </div>
                    {this.renderTextUnitInfo()}
                    <hr />
                    <div className={"row"}>
                        <div className={"col-sm-4"}><h4><FormattedMessage id={"textUnit.gitBlameModal.gitBlame"}/></h4></div>
                        <div className={"col-sm-8"}>{this.props.loading ? (<span className="glyphicon glyphicon-refresh spinning" />) : ""}</div>
                    </div>
                    {this.renderGitBlameInfo()}
                    <hr />
                    <div className={"row"}>
                        <div className={"col-sm-4"}><h4><FormattedMessage id={"textUnit.gitBlameModal.more"}/></h4></div>
                    </div>
                    {this.renderDebugInfo()}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" onClick={this.closeModal}>
                        <FormattedMessage id={"textUnit.gitBlameModal.close"}/>
                    </Button>
                </Modal.Footer>
            </Modal>
    );
    }
});

export default withAppConfig(injectIntl(GitBlameInfoModal));