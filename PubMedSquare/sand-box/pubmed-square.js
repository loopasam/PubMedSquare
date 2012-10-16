$(document).ready(function() {

	current_query = $('#search-bar-input').val();
	$('#search-bar-input').val(help_text);

	$('#search-button').click(function(){
		var query = $('#search-bar-input').val();
		if(query != help_text && query != ""){
			if(query != current_query){
				isReviewQuery = false;
				$('.article').remove();
				$('#sort-citations > .button-filter').removeClass("clicked");
				$('#sort-date > .button-filter').addClass("clicked");
				window_articles = 0;
				window_reviews = 0;
				noMoreReviews = false;
				noMoreArticles = false;
				$container.isotope( 'remove', $('.article'));
				renderingMethod = "append";
				if(firstQuery == true){
					$("#loading").show();
					firstQuery = false;
				}
				$("#loading-small").show();
				$('#spelling-text').hide();
				//TODO remove this handling
				var re  =  new RegExp("#review");
				if(query.match(re)){
					var trimmedQuery = query.replace("#review", "");
					trimmedQuery = '(' + trimmedQuery + ') "review"[Filter]';
					console.log(trimmedQuery);
					query = trimmedQuery;
				}

				pubmedSearch(query);
			}
		}
	});

	$(document).keyup(function(e) {
		if (e.keyCode == 13) {
			$('#search-button').click();
		}
	});

	$('#search-bar-input').focus(function(){
		if($(this).val() == help_text){
			$(this).val("");
			$(this).removeClass("indication");
		}
	});

	$('#search-bar-input').focusout(function(){
		if($(this).val() == ""){
			$(this).val(help_text);
			$(this).addClass("indication");
		}
	});

	$('#container').isotope({
		masonry: {
			columnWidth: (163)
		},
		getSortData : {
			citation : function ( $elem ) {
				return parseInt($elem.attr('citation'), 10 );
			},
			date : function ( $elem ) {
				return parseInt($elem.attr('date'), 10 );
			}
		}
	}).isotope({ sortBy : 'date', sortAscending : false});


	$('#expand-all').click(function(){
		$('#loading-small').show(function(){
			$('.article').each(function(){
				if($(this).hasClass("small")){
					animateToBig($(this));
				}
			});
			$('#loading-small').hide();
		});
		return false;
	});

	$('#collapse-all').click(function(){
		$('#loading-small').show(function(){
			$('.article').each(function(){
				if($(this).hasClass("big")){
					animateToSmall($(this));
				}
			});
			$('#loading-small').hide();
		});
		return false;
	});


	$('#sort-citations').click(function(){
		$('#sort-date > .button-filter').removeClass("clicked");
		$('#sort-citations > .button-filter').addClass("clicked");
		$('#container').isotope({ sortBy : 'citation', sortAscending : false});
		return false;
	});

	$('#logo-text').click(function(){
		$('#explanations').fadeIn("slow");
		$('#container').hide();
	});
	
	$('#question-mark').click(function(){
		$('#explanations').fadeIn("slow");
		$('#container').hide();
	});

	$('#close-explanations').click(function(){
		$('#container').show();
		$('#explanations').fadeOut("slow");
	});


	$('#sort-date').click(function(){
		$('#sort-citations > .button-filter').removeClass("clicked");
		$('#sort-date > .button-filter').addClass("clicked");
		$('#container').isotope({ sortBy : 'date', sortAscending : false});
		return false;
	});

	$('#show-review').toggle(function(){
		$('#container').isotope({ filter: '.review' });
		$('#show-review > .button-filter').addClass("clicked");
		isReviewQuery = true;
		if(noMoreReviews == true){
			turnOffQueryButton();
		}else{
			turnOnQueryButton();
		}
		if($(".review").length == 0){
			$('#more-results').click();
		}
		return false;
	}, function(){
		$('#container').isotope({ filter: '*:not(.review)' });
		$('#show-review > .button-filter').removeClass("clicked");
		isReviewQuery = false;
		if(noMoreArticles == true){
			turnOffQueryButton();
		}else{
			turnOnQueryButton();
		}
	});

	$('#more-results').click(function(){
		if(!$('#more-results .button-filter').hasClass('loading')){
			$('#loading-small').show();
			$('#more-results .button-filter').html("Loading articles...");
			$('#more-results .button-filter').addClass('loading');
			renderingMethod = "insert";
			pubmedSearch(current_query);
		}
		return false;
	});

});

var $container = $('#container');
var window_articles = 0;
var window_reviews = 0;
var current_query;
var help_text = "Type some keywords (e.g. 'cancer' or 'apoptosis regulation')";
var renderingMethod = "append";
var firstQuery = true;
var isReviewQuery = false;
var noMoreReviews = false;
var noMoreArticles = false;

function pubmedSearch(query){
	moveSearchBarToTheTop();
	current_query = query;

	//Do the spell check
	//TODO regarder mieux
//	var re  =  /\[Filter\]/;
//	if(!re.test(query)){
		$.ajax({
			type: "GET",
			async: true,
			url: "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/espell.fcgi?",
			data: { db: "pubmed", term: query},
			success: function(xml){
				var correctedQuery = $(xml).find('CorrectedQuery').text();
				if(correctedQuery != ""){
					$('#spelling-text').html("Do you mean <span id='corrected-text'>" + correctedQuery + "</span> ?");
					$('#spelling-text').show();
					$('#corrected-text').click(function(){
						$('#search-bar-input').val(correctedQuery);
						$('#spelling-text').hide();
						$('#search-button').click();
					});
				}
			},
			error: function(){
				$('#service-down').show();
				$("#loading").hide();
			}
		});
//	}

	var window;
	if(isReviewQuery){
		window = window_reviews;
		//TODO add a checking here for the tags
		query = '(' + query + ') "review"[Filter]';
	}else{
		window = window_articles;
	}

	$.ajax({
		type: "GET",
		async: true,
		url: "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
		data: { db: "pubmed", retmax: window+20, term: query}
	}).done(function( xml ) {
		var ids = [];
		$(xml).find('IdList Id').each(function(){
			ids.push($(this).text());
		});
		
		console.log(ids);

		if(ids.length == 0){
//			$('#warning-text').html("No article matching this query :-(");
			$("#loading").hide();
			$("#loading-small").hide();
			$('#filter-box').show();
			$('#warning-text').show();
			turnOffQueryButton();
		}

		var numberOfArticles = $(xml).find('eSearchResult > Count').text();
		console.log("search results: " + numberOfArticles);
		var id_to_retrieve = [];
		var noMoreResults = false;
		for(var i = window; i < window + 20; i++){
			if(ids[i] != undefined){
				id_to_retrieve.push(ids[i]);
			}else{
				noMoreResults = true;
			}
		}

		if(noMoreResults){
			if(isReviewQuery){
				noMoreReviews = true;
			}else{
				noMoreArticles = true;
			}
		}

		if(isReviewQuery){
			window_reviews = window_reviews + id_to_retrieve.length;
		}else{
			window_articles = window_articles + id_to_retrieve.length;
		}

		if(id_to_retrieve[0] != undefined){
			$.ajax({
				type: "GET",
				async: true,
				url: "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
				data: { db: "pubmed", id: id_to_retrieve.join(","), rettype: "full", retmode: "xml" }
			}).done(function( xml ) {
				$("#loading").hide();
				$('#loading-small').hide();
				$('#filter-box').show();
				$('#warning-text').show();
				if(noMoreResults){
					turnOffQueryButton();
				}else{
					turnOnQueryButton();
				}

				$(xml).find('PubmedArticle').each(function(){

					var year = $(this).find('[PubStatus="entrez"] Year').text();
					var month = $(this).find('[PubStatus="entrez"] Month').text();
					var day = $(this).find('[PubStatus="entrez"] Day').text();
					var daydate = parseInt(year)*365 + parseInt(month)*30 + parseInt(day);

					var dateString = year + " " + getMonth(month) + " " + day;

					var authorsList = "";
					var authorCounter = 0;
					var authors = $(this).find('AuthorList Author').each(function(){
						var lastname = $(this).find('LastName').text();
						var initial = $(this).find('Initials').text();
						if(authorCounter < 10){
							if(authorsList == ""){
								authorsList = lastname + " " + initial;
							}else{
								authorsList += ", " + lastname + " " + initial;
							}
							authorCounter++;
						}else if(authorCounter == 10){
							authorsList += "...";
							authorCounter++;
						}
					});

					var publicationTypes = [];
					$(this).find('PublicationTypeList PublicationType').each(function(){
						var publication = $(this).text();
						publicationTypes.push(publication.toLowerCase());
					});

					var abstractText = $(this).find('AbstractText').text();
					var title = $(this).find('ArticleTitle').text();
					var issn = $(this).find('ISSNLinking').text();
					var pmid = $(this).find('MedlineCitation > PMID').text();
					console.log(pmid);
					var affiliation = $(this).find('Affiliation').text();
					var abbrevJournal = $(this).find('MedlineTA').text();
					var impact = getCitation(issn);

					var article = new Article();
					article.setImpact(impact);
					article.title = title;
					article.pmid = pmid;
					article.affiliation = affiliation;
					article.abbrevJournal = abbrevJournal;
					article.date = daydate;
					article.dateString = dateString;
					article.authors = authorsList;
					article.publicationTypes = publicationTypes;
					article.isReview = isReview(publicationTypes);
					article.abstractText = abstractText;
					article.registerClick($container);

					if(!isReviewQuery && !article.isReview){
						article.render($container, renderingMethod);
					}else if(isReviewQuery && article.isReview){
						article.render($container, renderingMethod);
					}else{
						console.log("catched by filter");
						console.log(pmid);
					}
				});
			});
		}
	});
}

function isReview(publicationTypes){
	for(var i in publicationTypes){
		if(publicationTypes[i] == "review"){
			return true;
		}
	}
	return false;
}

function moveSearchBarToTheTop(){
	$("#out").animate({
		top: "0%"
	}, 200 );
}

function turnOffQueryButton(){
	$('#more-results .button-filter').addClass('loading');
	$('#more-results .button-filter').html("No more results");
	$('#more-results .button-filter').addClass("blocked");
}

function turnOnQueryButton() {
	$('#more-results .button-filter').html("More results");
	$('#more-results .button-filter').removeClass('loading');
}

function getMonth(number){
	var month = "month";
	switch (parseInt(number)) {
	case 1: month = 'Jan'; break; 
	case 2: month = 'Feb'; break;
	case 3: month = 'Mar'; break;
	case 4: month = 'Apr'; break;
	case 5: month = 'May'; break;
	case 6: month = 'Jun'; break;
	case 7: month = 'Jul'; break;
	case 8: month = 'Aug'; break;
	case 9: month = 'Sep'; break;
	case 10: month = 'Oct'; break;
	case 11: month = 'Nov'; break;
	case 12: month = 'Dec'; break;
	}
	return month;


}