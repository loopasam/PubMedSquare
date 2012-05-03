function Article() {

	this.journal_citation;
	this.element = $('<div class="small article element" title="Click to open" citation="0" date="0" ></div>');
	this.title = "[Title not retieved]";
	this.abstractText = "[No abstract available]";
	this.publicationTypes = [];
	this.isReview = false;
	this.date;
	this.dateString;
	this.authors;
	this.abbrevJournal;
	this.pmid;
	this.abstractText;
	this.affiliation;
	this.color= "white";
}

Article.prototype.registerClick = function($container){
	var that = this.element;

	this.element.click(function(){
		if(that.hasClass("small")){
			animateToBig(that);
		}
	});

	this.element.dblclick(function(){
		if(that.hasClass("big")){
			animateToSmall(that);
		}
	});
};

Article.prototype.render = function($container){

	//TODO put a while loop and check for text height instead
	var trimmedTitle;
	if(this.title.length > 110){
		trimmedTitle = this.title.substring(0, 110) + "...";
	}else{
		trimmedTitle = this.title;
	}

	var titleArticle = $('<div class="text-title-article">' + trimmedTitle + '</div>');
	this.element.append(titleArticle);
	this.element.css('background-color', this.color);
	this.element.attr('citation', this.journal_citation);

	if(this.isReview == true){
		this.element.addClass("review");
	}
	$('#container').isotope( 'insert', this.element );

	var fullTitle = $('<div class="full-title">'+this.title+'</div>');
	this.element.append(fullTitle);

	var authorList = $('<div class="authors">'+ this.authors +'</div>');
	this.element.append(authorList);


	var trimmedAffiliation;
	if(this.affiliation.length > 100){
		trimmedAffiliation = this.affiliation.substring(0, 100) + "...";
	}else{
		trimmedAffiliation = this.affiliation;
	}

	var affiliation = $('<div class="affiliation">'+trimmedAffiliation+'</div>');
	this.element.append(affiliation);

	var dateStringElement = $('<div class="date-label">'+this.dateString+'</div>');
	this.element.append(dateStringElement);

	var abbrevJournal = $('<div class="abbrev-journal">' + this.abbrevJournal + '</div>');
	this.element.append(abbrevJournal);

	var buttonsHolder = $('<div class="button-holder"></div>');

	var pmidLink = $('<div title="Get the article on PubMed" class="pmid-link "><a class="button-extended" href="http://www.ncbi.nlm.nih.gov/pubmed/'+this.pmid+'" target="BLANK">Get article</a></div>');
	buttonsHolder.append(pmidLink);

	var showAbstractButton = $('<div title="Show/Hide the abstract" class="show-abstract-button button-extended">Show Abstract</div>');
	registerAbstractButton(this.element, showAbstractButton);
	buttonsHolder.append(showAbstractButton);


	this.element.append(buttonsHolder);


	var trimmedAbstract = this.abstractText.replace(/(http:\/\/.*?)([\s(),]|\.{0,1}$)/g, '<a target="BLANK" href="$1">$1</a>$2');
	if(this.abstractText.length > 2000){
		trimmedAbstract = trimmedAbstract.substring(0, 2000) + '...<a target="BLANK" href="http://www.ncbi.nlm.nih.gov/pubmed/' +this.pmid+'">[read&nbsp;more]</a>';
	}

	this.element.append('<div class="abstract-text">' +trimmedAbstract + '</div>');

	this.element.attr('date', this.date);
	this.element.attr('isReview', this.isReview);

	var sizeText = titleArticle.height();
	titleArticle.css('margin-top', '-' + sizeText/2 + 'px');

};

Article.prototype.setImpact = function(impact){

	if(impact != undefined){
		this.journal_citation = impact;
	}

	var red;
	var green;

	if(impact < 11){
		red = Math.round(-5.1*impact + 242);
		green = Math.round(-2.3*impact + 249);
	}else{
		red = Math.round(-63*(impact - 10)/84 + 191);
		green = Math.round(-29*(impact - 10)/84 + 226);
	}

	if(isNaN(red)){
		this.color = "#fff";
	}else{
		this.color = "rgb(" + red + ", " + green + ", 255)";
	}

};

function registerAbstractButton(element, showAbstractButton){
	showAbstractButton.click(function(){

		var text = element.find(".abstract-text");

		if(element.hasClass("extended")){
			showAbstractButton.removeClass("extended-mode");
			showAbstractButton.text("Show Abstract");
			text.hide();
			element.removeClass("extended");
			var width = element.css('width');
			width = width.substring(0, width.length - 2);
			var height = element.css('height');
			height = height.substring(0, height.length - 2);
			var newHeight = (height-16)/2;
			var newWidth = (width-16)/2;
			element.css('height', newHeight + "px");
			element.css('width', newWidth + "px");
		}else{
			text.show();
			showAbstractButton.addClass("extended-mode");
			showAbstractButton.text("Hide Abstract");
			element.addClass("extended");
			var width = element.css('width');
			width = width.substring(0, width.length - 2);
			var height = element.css('height');
			height = height.substring(0, height.length - 2);
			var newHeight = height*2+16;
			var newWidth = width*2+16;
			element.css('height', newHeight + "px");
			element.css('width', newWidth + "px");
		}
		$("#container").isotope( 'reLayout');
	});
}

function animateToBig(that){
	that.removeClass("small");
	that.addClass("big");
	var width = that.css('width');
	width = width.substring(0, width.length - 2);
	var height = that.css('height');
	height = height.substring(0, height.length - 2);
	var newHeight = height*2+16;
	var newWidth = width*2+16;
	that.css('height', newHeight + "px");
	that.css('width', newWidth + "px");
	that.children().show();

	that.find('.text-title-article').hide();
	that.find('.abstract-text').hide();
	that.attr('title', 'Double-click to close');

	$("#container").isotope( 'reLayout');

}

function animateToSmall(that){

	if(that.hasClass("extended")){
		that.find('.abstract-text').hide();
		that.find('.show-abstract-button').removeClass("extended-mode");
		that.find('.show-abstract-button').text("Show Abstract");
		that.removeClass("extended");
		var width = that.css('width');
		width = width.substring(0, width.length - 2);
		var height = that.css('height');
		height = height.substring(0, height.length - 2);
		var newHeight = (height-16)/2;
		var newWidth = (width-16)/2;
		that.css('height', newHeight + "px");
		that.css('width', newWidth + "px");
	}

	that.attr('title', 'Click to open');
	that.removeClass("big");
	that.addClass("small");
	var width = that.css('width');
	width = width.substring(0, width.length - 2);
	var height = that.css('height');
	height = height.substring(0, height.length - 2);
	var newHeight = (height-16)/2;
	var newWidth = (width-16)/2;
	that.css('height', newHeight + "px");
	that.css('width', newWidth + "px");

	that.children().hide();
	that.find('.text-title-article').show();

	$("#container").isotope( 'reLayout');

}