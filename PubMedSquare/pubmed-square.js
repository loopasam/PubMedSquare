$(document).ready(function() {

	//TODO check if conencted --> error message

	//TODO explanation when click on 'pubmed logo'

	current_query = $('#search-bar-input').val();
	$('#search-bar-input').val(help_text);

	//TODO convert the review tag into review query: (rdf) AND "review"[Filter]

	$('#search-button').click(function(){
		//TODO check if the query is still the same
		//TODO ne pas forcement afficher le loading
		$("#loading").show();
		pubmedSearch($('#search-bar-input').val());
	});

	$(document).keyup(function(e) {
		//TODO checker s'il reste des articles a DL ou nan
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
	}).isotope({ sortBy : 'date', sortAscending : true});


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

	$('#sort-date').click(function(){
		$('#sort-citations > .button-filter').removeClass("clicked");
		$('#sort-date > .button-filter').addClass("clicked");
		$('#container').isotope({ sortBy : 'date', sortAscending : true});
		return false;
	});

	$('#show-review').toggle(function(){
		$('#container').isotope({ filter: '.review' });
		$('#show-review > .button-filter').addClass("clicked");
		return false;
	}, function(){
		$('#container').isotope({ filter: '*' });
		$('#show-review > .button-filter').removeClass("clicked");
	});

	$('#more-results').click(function(){
		//TODO check if query is still the same
		if(!$('#more-results .button-filter').hasClass('loading')){
			$('#loading-small').show();
			$('#more-results .button-filter').html("Loading articles...");
			$('#more-results .button-filter').addClass('loading');
			pubmedSearch(current_query);
		}
		return false;
	});

});

var $container = $('#container');
var window_articles = 0;
var current_query;
var help_text = "Keywords (e.g. 'cancer'), title, author, date, #review";

function pubmedSearch(query){

	moveSearchBarToTheTop();
	current_query = query;
	//TODO dealing with the query errors there like no results, etx....
	//TODO put this request dans une method separee
	$.ajax({
		type: "GET",
		async: true,
		url: "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
		data: { db: "pubmed", retmax: window_articles+20, term: query }
	}).done(function( xml ) {
		var ids = [];
		$(xml).find('IdList Id').each(function(){
			ids.push($(this).text());
		});

		var numberOfArticles = $(xml).find('eSearchResult > Count').text();
		var id_to_retrieve = [];
		var noMoreResults = false;
		//TODO error message if no more things available
		for(var i = window_articles; i < window_articles + 20; i++){
			if(ids[i] != undefined){
				id_to_retrieve.push(ids[i]);
			}else{
				noMoreResults = true;
			}
		}

		window_articles = window_articles + id_to_retrieve.length;
		if(id_to_retrieve[0] != undefined){
			$.ajax({
				type: "GET",
				async: true,
				url: "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
				data: { db: "pubmed", id: id_to_retrieve.join(","), rettype: "full", retmode: "xml" }
			}).done(function( xml ) {
				$('#warning-text').html(window_articles + " articles over " + numberOfArticles);
				$("#loading").hide();
				$('#loading-small').hide();
				$('#filter-box').show();
				$('#warning-text').show();
				if(noMoreResults){
					$('#more-results .button-filter').addClass('loading');
					$('#more-results .button-filter').html("No more results");
					$('#more-results .button-filter').addClass("blocked");
				}else{
					$('#more-results .button-filter').html("More results");
					$('#more-results .button-filter').removeClass('loading');
				}

				$(xml).find('PubmedArticle').each(function(){

					var year = $(this).find('[PubStatus="entrez"] Year').text();
					var month = $(this).find('[PubStatus="entrez"] Month').text();
					var day = $(this).find('[PubStatus="entrez"] Day').text();
					var daydate = year*365 + month*12 + day;

					var dateString = year + " " + getMonth(month) + " " + day;

					var authorsList = "";

					var authors = $(this).find('AuthorList Author').each(function(){
						var lastname = $(this).find('LastName').text();
						var initial = $(this).find('Initials').text();

						if(authorsList == ""){
							authorsList = lastname + " " + initial;
						}else{
							authorsList += ", " + lastname + " " + initial;
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
					var affiliation = $(this).find('Affiliation').text();
					var abbrevJournal = $(this).find('MedlineTA').text();
					var impact = getCitation(issn);

					var article = new Article();
					//TODO gerer les errueurs si les fielsds sont blanc, checl for null
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
					article.render($container);
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
	}, 800 );
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