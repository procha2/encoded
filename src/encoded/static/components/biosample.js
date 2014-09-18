/** @jsx React.DOM */
'use strict';
var React = require('react');
var _ = require('underscore');
var url = require('url');
var globals = require('./globals');
var dataset = require('./dataset');
var fetched = require('./fetched');
var dbxref = require('./dbxref');
var statuslabel = require('./statuslabel');
var image = require('./image');

var DbxrefList = dbxref.DbxrefList;
var StatusLabel = statuslabel.StatusLabel;

var ExperimentTable = dataset.ExperimentTable;
var FetchedItems = fetched.FetchedItems;

var Attachment = image.Attachment;


var Panel = function (props) {
    // XXX not all panels have the same markup
    var context;
    if (props['@id']) {
        context = props;
        props = {context: context, key: context['@id']};
    }
    return globals.panel_views.lookup(props.context)(props);
};


var Biosample = module.exports.Biosample = React.createClass({
    render: function() {
        var context = this.props.context;
        var itemClass = globals.itemClass(context, 'view-item');
        var aliasList = context.aliases.join(", ");

        // set up construct documents panels
        var constructs = _.sortBy(context.constructs, function(item) {
            return item.uuid;
        });
        var construct_documents = {};
        constructs.forEach(function (construct) {
            construct.documents.forEach(function (doc) {
                construct_documents[doc['@id']] = Panel({context: doc});
            });
        });

        // set up RNAi documents panels
        var rnais = _.sortBy(context.rnais, function(item) {
            return item.uuid; //may need to change
        });
        var rnai_documents = {};
        rnais.forEach(function (rnai) {
            rnai.documents.forEach(function (doc) {
                rnai_documents[doc['@id']] = Panel({context: doc});
            });
        });

        // Make string of alternate accessions
        var altacc = context.alternate_accessions ? context.alternate_accessions.join(', ') : undefined;

        var experiments_url = '/search/?type=experiment&replicates.library.biosample.uuid=' + context.uuid;

        return (
            <div className={itemClass}>
                <header className="row">
                    <div className="col-sm-12">
                        <ul className="breadcrumb">
                            <li>Biosamples</li>
                            <li>{context.biosample_type}</li>
                            {context.donor ?
                                <li className="active"><em>{context.donor.organism.scientific_name}</em></li>
                            : null }
                        </ul>
                        <h2>
                            {context.accession}{' / '}<span className="sentence-case">{context.biosample_type}</span>
                        </h2>
                        {altacc ? <h4 className="repl-acc">Replaces {altacc}</h4> : null}
                        <div className="characterization-status-labels">
                            <StatusLabel title="Status" status={context.status} />
                        </div>
                    </div>
                </header>
                <div className="panel data-display">
                    <dl className="key-value">
                        <div data-test="term-name">
                            <dt>Term name</dt>
                            <dd>{context.biosample_term_name}</dd>
                        </div>

                        <div data-test="term-id">
                            <dt>Term ID</dt>
                            <dd>{context.biosample_term_id}</dd>
                        </div>

                        {context.description ? 
                            <div data-test="description">
                                <dt>Description</dt>
                                <dd className="sentence-case">{context.description}</dd>
                            </div>
                        : null}

                        {context.subcellular_fraction_term_name ?
                            <div data-test="subcellular-term-name">
                                <dt>Subcellular fraction</dt>
                                <dd>{context.subcellular_fraction_term_name}</dd>
                            </div>
                        : null}

                        <div data-test="source-title">
                            <dt>Source</dt>
                            <dd><a href={context.source.url}>{context.source.title}</a></dd>
                        </div>

                        {context.product_id ?
                            <div data-test="product-id">
                                <dt>Product ID</dt>
                                <dd><maybe_link href={context.url}>{context.product_id}</maybe_link></dd>
                            </div>
                        : null}

                        {context.lot_id ?
                            <div data-test="lot-id">
                                <dt>Lot ID</dt>
                                <dd>{context.lot_id}</dd>
                            </div>
                        : null}

                        <div data-test="project">
                            <dt>Project</dt>
                            <dd>{context.award.project}</dd>
                        </div>

                        <div data-test="submitted-by">
                            <dt>Submitted by</dt>
                            <dd>{context.submitted_by.title}</dd>
                        </div>

                        <div data-test="lab">
                            <dt>Lab</dt>
                            <dd>{context.lab.title}</dd>
                        </div>

                        <div data-test="grant">
                            <dt>Grant</dt>
                            <dd>{context.award.name}</dd>
                        </div>

                        {context.aliases.length ?
                            <div data-test="aliases">
                                <dt>Aliases</dt>
                                <dd>{aliasList}</dd>
                            </div>
                        : null}

                        {context.dbxrefs.length ?
                            <div data-test="external-resources">
                                <dt>External resources</dt>
                                <dd><DbxrefList values={context.dbxrefs} /></dd>
                            </div>
                        : null}

                        {context.note ?
                            <div data-test="note">
                                <dt>Note</dt>
                                <dd>{context.note}</dd>
                            </div>
                        : null}

                        {context.date_obtained ?
                            <div data-test="date-obtained">
                                <dt>Date obtained</dt>
                                <dd>{context.date_obtained}</dd>
                            </div>
                        : null}

                        {context.starting_amount ?
                            <div data-test="starting-amount">
                                <dt>Starting amount</dt>
                                <dd>{context.starting_amount}<span className="unit">{context.starting_amount_units}</span></dd>
                            </div>
                        : null}

                        {context.culture_start_date ?
                            <div data-test="culture-start-date">
                                <dt>Culture start date</dt>
                                <dd>{context.culture_start_date}</dd>
                            </div>
                        : null}

                        {context.culture_harvest_date ?
                            <div data-test="culture-harvest-date">
                                <dt>Culture harvest date</dt>
                                <dd>{context.culture_harvest_date}</dd>
                            </div>
                        : null}

                        {context.passage_number ?
                            <div data-test="passage-number">
                                <dt>Passage number</dt>
                                <dd>{context.passage_number}</dd>
                            </div>
                        : null}

                        {context.donor && context.donor.organism.name !== 'human' ?
                            <div>
                                {context.life_stage ?
                                    <div data-test="life-stage">
                                        <dt>Life stage</dt>
                                        <dd className="sentence-case">{context.life_stage}</dd>
                                    </div>
                                : null}

                                {context.age ?
                                    <div data-test="age">
                                        <dt>Age</dt>
                                        <dd className="sentence-case">{context.age}{context.age_units ? ' ' + context.age_units : null}</dd>
                                    </div>
                                : null}
                            </div>
                        : null}

                        {context.synchronization ?
                            <div data-test="synchronization-stage">
                                <dt>Synchronization stage</dt>
                                <dd>{context.synchronization}</dd>
                            </div>
                        : null}

                        {context.post_synchronization_time ?
                            <div data-test="synchronization-time">
                                <dt>Post-synchronization time</dt>
                                <dd className="sentence-case">
                                    {context.post_synchronization_time}{context.post_synchronization_time_units ? ' ' + context.post_synchronization_time_units : null}
                                </dd>
                            </div>
                        : null}
                    </dl>

                    {context.derived_from ?
                        <section data-test="derived-from">
                            <hr />
                            <h4>Derived from biosample</h4>
                            <a className="non-dl-item" href={context.derived_from['@id']}> {context.derived_from.accession} </a>
                        </section>
                    : null}

                    {context.part_of ?
                        <section data-test="separated-from">
                            <hr />
                            <h4>Separated from biosample</h4>
                            <a className="non-dl-item" href={context.part_of['@id']}> {context.part_of.accession} </a>
                        </section>
                    : null}

                    {context.pooled_from.length ?
                        <section data-test="pooled-from">
                            <hr />
                            <h4>Pooled from biosamples</h4>
                            <ul className="non-dl-list">
                                {context.pooled_from.map(function (biosample) {
                                    return (
                                        <li key={biosample['@id']}>
                                            <a href={biosample['@id']}>{biosample.accession}</a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    : null}

                    {context.treatments.length ?
                        <section>
                            <hr />
                            <h4>Treatment details</h4>
                            {context.treatments.map(Panel)}
                        </section>
                    : null}

                    {context.constructs.length ?
                        <section>
                            <hr />
                            <h4>Construct details</h4>
                            {context.constructs.map(Panel)}
                        </section>
                    : null}

                    {context.rnais.length ?
                        <section>
                            <hr />
                            <h4>RNAi details</h4>
                            {context.rnais.map(Panel)}
                        </section>
                    : null}

                </div>

                {context.donor ?
                    <div>
                        <h3>{context.donor.organism.name === 'human' ? 'Donor' : 'Strain'} information</h3>
                        <div className="panel data-display">
                            <Panel context={context.donor} biosample={context} />
                        </div>
                    </div>
                : null}

                {context.protocol_documents.length ?
                    <div>
                        <h3>Protocol documents</h3>
                        {context.protocol_documents.map(Panel)}
                    </div>
                : null}

                {context.characterizations.length ?
                    <div>
                        <h3>Characterizations</h3>
                        {context.characterizations.map(Panel)}
                    </div>
                : null}

                {Object.keys(construct_documents).length ?
                    <div>
                        <h3>Construct documents</h3>
                        {construct_documents}
                    </div>
                : null}

                {Object.keys(rnai_documents).length ?
                    <div>
                        <h3>RNAi documents</h3>
                        {rnai_documents}
                    </div>
                : null}

                {this.transferPropsTo(
                    <FetchedItems url={experiments_url} Component={ExperimentsUsingBiosample} />
                )}
            </div>
        );
    }
});

globals.content_views.register(Biosample, 'biosample');


var ExperimentsUsingBiosample = module.exports.ExperimentsUsingBiosample = React.createClass({
    render: function () {
        var context = this.props.context;
        return (
            <div>
                <h3>Experiments using biosample {context.accession}</h3>
                {this.transferPropsTo(
                    <ExperimentTable />
                )}
            </div>
        );
    }
});


var maybe_link = function (props, children) {
    if (props.href == 'N/A') {
        return children;
    } else {
        return (
            <a href={props.href}>{children}</a>
        );
    }
};

var HumanDonor = module.exports.HumanDonor = React.createClass({
    render: function() {
        var context = this.props.context;
        var biosample = this.props.biosample;
        return (
            <dl className="key-value">
                <div data-test="accession">
                    <dt>Accession</dt>
                    <dd>{context.accession}</dd>
                </div>

                {context.aliases.length ?
                    <div data-test="aliases">
                        <dt>Aliases</dt>
                        <dd>{context.aliases.join(", ")}</dd>
                    </div>
                : null}

                {context.organism.scientific_name ?
                    <div data-test="species">
                        <dt>Species</dt>
                        <dd className="sentence-case"><em>{context.organism.scientific_name}</em></dd>
                    </div>
                : null}

                {context.life_stage ?
                    <div data-test="life-stage">
                        <dt>Life stage</dt>
                        <dd className="sentence-case">{context.life_stage}</dd>
                    </div>
                : null}

                {context.age ?
                    <div data-test="age">
                        <dt>Age</dt>
                        <dd className="sentence-case">{context.age}{context.age_units ? ' ' + context.age_units : null}</dd>
                    </div>
                : null}

                {context.sex ?
                    <div data-test="sex">
                        <dt>Sex</dt>
                        <dd className="sentence-case">{context.sex}</dd>
                    </div>
                : null}

                {context.health_status ?
                    <div data-test="health-status">
                        <dt>Health status</dt>
                        <dd className="sentence-case">{context.health_status}</dd>
                    </div>
                : null}

                {context.ethnicity ?
                    <div data-test="ethnicity">
                        <dt>Ethnicity</dt>
                        <dd className="sentence-case">{context.ethnicity}</dd>
                    </div>
                : null}
            </dl>
        );
    }
});

globals.panel_views.register(HumanDonor, 'human_donor');


var MouseDonor = module.exports.MouseDonor = React.createClass({
    render: function() {
        var context = this.props.context;
        var biosample = this.props.biosample;
        return (
            <dl className="key-value">
                <div data-test="accession">
                    <dt>Accession</dt>
                    <dd>{context.accession}</dd>
                </div>

                {context.aliases.length ?
                    <div data-test="aliases">
                        <dt>Aliases</dt>
                        <dd>{context.aliases.join(", ")}</dd>
                    </div>
                : null}

                {context.organism.scientific_name ?
                    <div data-test="organism">
                        <dt>Species</dt>
                        <dd className="sentence-case"><em>{context.organism.scientific_name}</em></dd>
                    </div>
                : null}

                {context.genotype ?
                    <div data-test="genotype">
                        <dt>Genotype</dt>
                        <dd>{context.genotype}</dd>
                    </div>
                : null}

                {biosample && biosample.sex ?
                    <div data-test="sex">
                        <dt>Sex</dt>
                        <dd className="sentence-case">{biosample.sex}</dd>
                    </div>
                : null}

                {biosample && biosample.health_status ?
                    <div data-test="health-status">
                        <dt>Health status</dt>
                        <dd className="sentence-case">{biosample.health_status}</dd>
                    </div>
                : null}

                {context.strain_background ?
                    <div data-test="strain-background">
                        <dt>Strain background</dt>
                        <dd className="sentence-case">{context.strain_background}</dd>
                    </div>
                : null}

                {context.strain_name ?
                    <div data-test="strain-name">
                        <dt>Strain name</dt>
                        <dd>{context.strain_name}</dd>
                    </div>
                : null}
            </dl>
        );
    }
});

globals.panel_views.register(MouseDonor, 'mouse_donor');


var FlyWormDonor = module.exports.FlyDonor = React.createClass({
    render: function() {
        var context = this.props.context;
        var biosample = this.props.biosample;
        return (
            <div>
                <dl className="key-value">
                    <div data-test="accession">
                        <dt>Accession</dt>
                        <dd>{context.accession}</dd>
                    </div>

                    {context.aliases.length ?
                        <div data-test="aliases">
                            <dt>Aliases</dt>
                            <dd>{context.aliases.join(", ")}</dd>
                        </div>
                    : null}

                    {context.organism.scientific_name ?
                        <div data-test="species">
                            <dt>Species</dt>
                            <dd className="sentence-case"><em>{context.organism.scientific_name}</em></dd>
                        </div>
                    : null}

                    {context.genotype ?
                        <div data-test="genotype">
                            <dt>Genotype</dt>
                            <dd>{context.genotype}</dd>
                        </div>
                    : null}

                    {biosample && biosample.sex ?
                        <div data-test="sex">
                            <dt>Sex</dt>
                            <dd className="sentence-case">{biosample.sex}</dd>
                        </div>
                    : null}

                    {biosample && biosample.health_status ?
                        <div data-test="health-status">
                            <dt>Health status</dt>
                            <dd className="sentence-case">{biosample.health_status}</dd>
                        </div>
                    : null}

                    {context.strain_background ?
                        <div data-test="strain-background">
                            <dt>Strain background</dt>
                            <dd className="sentence-case">{context.strain_background}</dd>
                        </div>
                    : null}

                    {context.strain_name ?
                        <div data-test="strain-name">
                            <dt>Strain name</dt>
                            <dd>{context.strain_name}</dd>
                        </div>
                    : null}
                </dl>

                {biosample && biosample.model_organism_donor_constructs && biosample.model_organism_donor_constructs.length ?
                    <section>
                        <hr />
                        <h4>Construct details</h4>
                        {biosample.model_organism_donor_constructs.map(Panel)}
                    </section>
                : null}

                {biosample && biosample.donor.characterizations && biosample.donor.characterizations.length ?
                    <section>
                        <hr />
                        <h4>Characterizations</h4>
                        {biosample.donor.characterizations.map(Panel)}
                    </section>
                : null}

            </div>
        );
    }
});

globals.panel_views.register(FlyWormDonor, 'fly_donor');
globals.panel_views.register(FlyWormDonor, 'worm_donor');


var Treatment = module.exports.Treatment = React.createClass({
    render: function() {
        var context = this.props.context;
        var title = '';
        if (context.concentration) {
            title += context.concentration + ' ' + context.concentration_units + ' ';
        }
        title += context.treatment_term_name + ' (' + context.treatment_term_id + ') ';
        if (context.duration) {
            title += 'for ' + context.duration + ' ' + context.duration_units;
        }
        return (
            <dl className="key-value">
                <dt>Treatment</dt>
                <dd>{title}</dd>

                <dt>Type</dt>
                <dd>{context.treatment_type}</dd>

            </dl>
        );
    }
});

globals.panel_views.register(Treatment, 'treatment');


var Construct = module.exports.Construct = React.createClass({
    render: function() {
        var context = this.props.context;
        return (
            <dl className="key-value">
                {context.target ? <dt>Target</dt> : null}
                {context.target ? <dd><a href={context.target['@id']}>{context.target.name}</a></dd> : null}

                {context.vector_backbone_name ? <dt>Vector</dt> : null}
                {context.vector_backbone_name ? <dd>{context.vector_backbone_name}</dd> : null}

                {context.construct_type ? <dt>Construct Type</dt> : null}
                {context.construct_type ? <dd>{context.construct_type}</dd> : null}

                {context.description ?  <dt>Description</dt> : null}
                {context.description ? <dd>{context.description}</dd> : null}

                {context.tags.length ? <dt>Tags</dt> : null}
                {context.tags.length ? <dd>
                    <ul>
                        {context.tags.map(function (tag, index) {
                            return (
                                <li key={index}>
                                    {tag.name} (Location: {tag.location})
                                </li>
                            );
                        })}
                    </ul>
                </dd> : null}

                {context.source.title ? <dt>Source</dt> : null}
                {context.source.title ? <dd>{context.source.title}</dd> : null}

                {context.product_id ? <dt>Product ID</dt> : null}
                {context.product_id ? <dd><maybe_link href={context.url}>{context.product_id}</maybe_link></dd> : null}
            </dl>
        );
    }
});

globals.panel_views.register(Construct, 'construct');


var RNAi = module.exports.RNAi = React.createClass({
    render: function() {
        var context = this.props.context;
        return (
             <dl className="key-value">
                {context.target ? <dt>Target</dt> : null}
                {context.target ? <dd><a href={context.target['@id']}>{context.target.name}</a></dd> : null}
                
                {context.rnai_type ? <dt>RNAi type</dt> : null}
                {context.rnai_type ? <dd>{context.rnai_type}</dd> : null}
                
                {context.source.title ? <dt>Source</dt> : null}
                {context.source.title ? <dd><a href={context.source.url}>{context.source.title}</a></dd> : null}

                {context.product_id ? <dt>Product ID</dt> : null}
                {context.product_id ? <dd><a href={context.url}>{context.product_id}</a></dd> : null}

                {context.rnai_target_sequence ? <dt>Target sequence</dt> : null}
                {context.rnai_target_sequence ? <dd>{context.rnai_target_sequence}</dd> : null}

                {context.vector_backbone_name ? <dt>Vector backbone</dt> : null}
                {context.vector_backbone_name ? <dd>{context.vector_backbone_name}</dd> : null}                
            </dl>
        );
    }
});

globals.panel_views.register(RNAi, 'rnai');


var Document = module.exports.Document = React.createClass({
    render: function() {
        var context = this.props.context;
        var figure = <Attachment context={this.props.context} className="characterization" />;

        var attachmentHref, download;
        if (context.attachment) {
            attachmentHref = url.resolve(context['@id'], context.attachment.href);
            download = (
                <a data-bypass="true" href={attachmentHref} download={context.attachment.download}>
                    {context.attachment.download}
                </a>
            );
        } else {
            download = (
                <em>Document not available</em>
            );
        }

        return (
            <section className={context['@type'][0] !== 'donor_characterization' ? 'type-document view-detail panel status-none' : ''}>
                <div className="row">
                    <div className="col-sm-5 col-md-6">
                        <figure>
                            {figure}
                        </figure>
                    </div>
                    <div className="col-sm-7 col-md-6">
                        <h3 className="sentence-case">{context.document_type}</h3>
                        <p>{context.description}</p>
                        <dl className="key-value">
                            {context.caption ?
                                <div data-test="caption">
                                    <dt>Caption</dt>
                                    <dd>{context.caption}</dd>
                                </div>
                            : null}

                            {context.submitted_by && context.submitted_by.title ?
                                <div data-test="submitted-by">
                                    <dt>Submitted by</dt>
                                    <dd>{context.submitted_by.title}</dd>
                                </div>
                            : null}

                            {context.lab && context.lab.title ?
                                <div data-test="title">
                                    <dt>Lab</dt>
                                    <dd>{context.lab.title}</dd>
                                </div>
                            : null}

                            {context.award && context.award.name ?
                                <div data-test="award-name">
                                    <dt>Grant</dt>
                                    <dd>{context.award.name}</dd>
                                </div>
                            : null}

                            <div data-test="download">
                                <dt><i className="icon icon-download"></i> Download</dt>
                                <dd>{download}</dd>
                            </div>

                            {context.references && context.references.length ?
                                <div data-test="references">
                                    <dt>References</dt>
                                    <dd><DbxrefList values={context.references} className="horizontal-list"/></dd>
                                </div>
                            : null}
                        </dl>
                    </div>
                </div>
            </section>
        );
    }
});

globals.panel_views.register(Document, 'document');
globals.panel_views.register(Document, 'biosample_characterization');
globals.panel_views.register(Document, 'donor_characterization');
