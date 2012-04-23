function Article() {
	this.journal_citation;
	this.element = $('<div class="article element" citation="0"></div>');
	this.title = "[Title not retieved]";
	//TODO: publi type, authors, date, abstract
	this.date;
	this.abbrevJournal;
	this.pmid;
	this.abstractText;
	this.affiliation;
	this.color= "white";
}

Article.prototype.render = function($container){
	this.element.text(this.title);
	this.element.css('background-color', this.color);
	this.element.attr('citation', this.journal_citation);
	$('#container').isotope( 'insert', this.element );
	console.log(this);
};

Article.prototype.setImpact = function(impact){
	//TODO statements
	if(impact != undefined){
		this.journal_citation = impact;
	}
	if(impact == 1){
		this.color = "orange";
	}else if(impact == 2){
		this.color = "yellow";
	}else if(impact > 2){
		this.color = "red";
	}else{
		this.color = "white";
	}
};