function Article() {

	this.journal_citation;
	this.element = $('<div class="article element" citation="0" date="0" ></div>');
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
	this.element.toggle(function(){
		var width = that.css('width');
		width = width.substring(0, width.length - 2);
		var height = that.css('height');
		height = height.substring(0, height.length - 2);
		var newHeight = height*2+10;
		var newWidth = width*2+10;
		that.css('height', newHeight + "px");
		that.css('width', newWidth + "px");

		that.children().show();
		that.find('.text-title-article').hide();

		$("#container").isotope( 'reLayout');

	}, function(){
		var width = that.css('width');
		width = width.substring(0, width.length - 2);
		var height = that.css('height');
		height = height.substring(0, height.length - 2);
		var newHeight = (height-10)/2;
		var newWidth = (width-10)/2;
		that.css('height', newHeight + "px");
		that.css('width', newWidth + "px");

		that.children().hide();
		that.find('.text-title-article').show();

		$("#container").isotope( 'reLayout');

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

	var dateStringElement = $('<div class="date-label">'+this.dateString+'</div>');
	this.element.append(dateStringElement);

	var abbrevJournal = $('<div class="abbrev-journal">' + this.abbrevJournal + '</div>');
	this.element.append(abbrevJournal);

	var authorList = $('<div class="authors">'+ this.authors +'</div>');
	this.element.append(authorList);

	var affiliation = $('<div class="affiliation">'+this.affiliation+'</div>');
	this.element.append(affiliation);

	var pmid = $('<div class="pmid">'+this.pmid+'</div>');
	this.element.append(pmid);

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