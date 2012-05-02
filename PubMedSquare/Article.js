function Article() {

	this.journal_citation;
	this.element = $('<div class="small article element" citation="0" date="0" ></div>');
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

	//TODO alt text double click close
	this.element.click(function(){

		if(that.hasClass("small")){
			
			//TODO appliquer deux fois la reduction (le moins et plus font merder)
			//sinon cacher l'abstract quoi qu'il en soit
			var factor = 2;
			if(that.hasClass("extended")){
				factor = 4;
			}
			
			that.removeClass("small");
			that.addClass("big");
			var width = that.css('width');
			width = width.substring(0, width.length - 2);
			var height = that.css('height');
			height = height.substring(0, height.length - 2);
			var newHeight = height*factor+16;
			var newWidth = width*factor+16;
			that.css('height', newHeight + "px");
			that.css('width', newWidth + "px");
			that.children().show();
			
			if(!that.hasClass("extended")){
				that.find('.abstract-text').hide();
			}
			
			that.find('.text-title-article').hide();

			$("#container").isotope( 'reLayout');
		}

	});

	this.element.dblclick(function(){

		
		if(that.hasClass("big")){
			
			var factor = 2;
			if(that.hasClass("extended")){
				factor = 4;
			}
			
			that.removeClass("big");
			that.addClass("small");
			var width = that.css('width');
			width = width.substring(0, width.length - 2);
			var height = that.css('height');
			height = height.substring(0, height.length - 2);
			var newHeight = (height-16)/factor;
			var newWidth = (width-16)/factor;
			that.css('height', newHeight + "px");
			that.css('width', newWidth + "px");

			that.children().hide();
			that.find('.text-title-article').show();

			$("#container").isotope( 'reLayout');
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
	if(this.affiliation.length > 180){
		console.log(this.title);
		trimmedAffiliation = this.affiliation.substring(0, 180) + "...";
	}else{
		trimmedAffiliation = this.affiliation;
	}

	var affiliation = $('<div class="affiliation">'+trimmedAffiliation+'</div>');
	this.element.append(affiliation);

	var dateStringElement = $('<div class="date-label">'+this.dateString+'</div>');
	this.element.append(dateStringElement);

	//TODO problem journal mapping
	var abbrevJournal = $('<div class="abbrev-journal">' + this.abbrevJournal + '</div>');
	this.element.append(abbrevJournal);

	var pmidLink = $('<div class="pmid-link"><a href="http://www.ncbi.nlm.nih.gov/pubmed/'+this.pmid+'">Get article</a></div>');
	this.element.append(pmidLink);

	var showAbstractButton = $('<div class="show-abstract-button">Show Abstract</div>');
	registerAbstractButton(this.element, showAbstractButton);
	this.element.append(showAbstractButton);

	this.element.append('<div class="abstract-text">' +this.abstractText + '</div>');

//	var pmid = $('<div class="pmid">'+this.pmid+'</div>');
//	this.element.append(pmid);

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

//TODO problem avec la taille des box quand l'abstract est montre
function registerAbstractButton(element, showAbstractButton){
	showAbstractButton.toggle(function(){
		element.find(".abstract-text").show();
		showAbstractButton.css('background-color', 'yellow');
		element.addClass("extended");
		var width = element.css('width');
		width = width.substring(0, width.length - 2);
		var height = element.css('height');
		height = height.substring(0, height.length - 2);
		var newHeight = height*2+16;
		var newWidth = width*2+16;
		element.css('height', newHeight + "px");
		element.css('width', newWidth + "px");
		$("#container").isotope( 'reLayout');

	}, function(){
		showAbstractButton.css('background-color', 'blue');
		element.find(".abstract-text").hide();
		element.removeClass("extended");
		var width = element.css('width');
		width = width.substring(0, width.length - 2);
		var height = element.css('height');
		height = height.substring(0, height.length - 2);
		var newHeight = (height-16)/2;
		var newWidth = (width-16)/2;
		element.css('height', newHeight + "px");
		element.css('width', newWidth + "px");
		$("#container").isotope( 'reLayout');

	});
}