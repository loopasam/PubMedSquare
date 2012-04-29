function Article() {
	
	this.journal_citation;
	this.element = $('<div class="article element" citation="0" date="0" ></div>');
	this.title = "[Title not retieved]";
	this.abstractText = "[No abstract available]";
	this.publicationTypes = [];
	this.isReview = false;
	this.date;
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
		var width = that.css('width');
		width = width.substring(0, width.length - 2);
		var height = that.css('height');
		height = height.substring(0, height.length - 2);

		that.css('height', height*2 + "px");
		that.css('width', width*2 + "px");
		$("#container").isotope( 'reLayout');

	});
};

Article.prototype.render = function($container){
	
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
	//TODO display date et abstract et author
	this.element.attr('date', this.date);
	this.element.attr('isReview', this.isReview);
	
	if(this.isReview == true){
		this.element.addClass("review");
	}
	$('#container').isotope( 'insert', this.element );

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