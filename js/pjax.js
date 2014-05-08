
/* ====== Josh Post, 2014 ====== */
	
	// on scroll stop
	jQuery.fn.scrollStopped = function(callback) {           
        jQuery(this).scroll(function(){
            var self = this, $this = jQuery(self);
            if (jQuery(this).data('scrollTimeout')) {
              clearTimeout(jQuery(this).data('scrollTimeout'));
            }
            jQuery(this).data('scrollTimeout', setTimeout(callback,250,self));
        });
    };

// Appends one article to the #fullArtilces div
// Requires the guid of an article
var getArticle = function(guid){
	var full = {};
	full.guid = guid
	$.get("fullarticles"+guid+".xml",
		function(response){
			$(response).find('article').each(function(){
				full.description = $(this).find('description').text();
				full.fullImage = $(this).find('fullImage').text();
				full.fullImage = $(this).find('bigImage').text();
			})
		})
		.done(function(){
			$.get("articles.xml",
				function(response){
					$(response).find('guid:contains('+full.guid+')').each(function(){
						var t = $(this).parent();
						full.title = jQuery(t).find('title').text();
						full.link = jQuery(t).find('webLink').text();
					});
				}).done(function(){
				$('.news-article').removeClass('current');
				//$('.articleLink:data(id=='+full.guid+')').addClass('current');
				var article = '<article class="news-article current" data-id="'+full.guid+'">';
				article += '<h1 class="news-article-title">'+full.title+'</h1>'
				article += '<img src="'+full.fullImage+'" alt="'+full.title+'"/>'
				article += '<div class="news-article-text">'+full.description+'</div>'
				article += '</article>';
				$(article).appendTo('#fullArticles');
				if($('#fullArticles').scrollTop() == 0) {
					//console.log($('#fullArticles').scrollTop());
					var cleanTitle = full.title.split(' ').join('-');
					console.log(cleanTitle);
					window.history.pushState("","",full.guid+"/"+cleanTitle);
					$('#fullArticles').scrollTop(150);
				}
			});
		});
}

// Load and create all article titles, ids and links
var loadBriefs = function(callback) {
	var briefs = [];
	$.get('articles.xml',
		function(response) {
			$(response).find('article').each(function(i, el){
				briefs.push({
					guid: $(this).find('guid').text(),
					title: $(this).find('title').text(),
					link: $(this).find('webLink').text()
				})
			});
		}
	)
	.done(function(){
		for(var i=0;i<briefs.length;i++) {
			if(typeof briefs[i].title != 'undefined' && typeof briefs[i].guid === 'string' && typeof briefs[i].link === 'string') {
				$('<li class="articleLink" data-id="'+briefs[i].guid+'"><a href="'+briefs[i].link+'">'+briefs[i].title+'</a></li>').appendTo('#articleList');
			}
		}
		callback();
	});
}

var loadNext = function(callback){
	var loadNext = $('#articleList li.current').next('li');
	if(typeof loadNext != 'undefined'){
		getArticle($(loadNext).data('id'));
	}
	if(typeof callback != 'undefined') {
		callback();
	}
}

var loadPrevious = function(callback){
	var loadPrevious = $('#articleList li.current').prev('li');
	if(typeof loadPrevious != 'undefined'){
		getArticle($(loadNext).data('id'));
	}
	if(typeof callback != 'undefined') {
		callback();
	}
}

// All listeners
$(document).ready(function(){

	$('#articles').scrollStopped(function(){
		//evt.preventDefault();
		console.log('Window height: ',$('#articles').outerHeight(), '\
			Window scrollTop: ', $('#articles').scrollTop(), '\
			Document from top: ',$('#fullArticles').offset().top, '\
			Document height: ',$('#fullArticles').height()
			);
		if(/*evt.wheelDelta < 0 && */$('#fullArticles').height() < $('#articles').height() && $('#articles').height()+$('#articles').scrollTop() > $('#fullArticles').height() -200 || $('#articles').height()+$('#articles').scrollTop() > $('#fullArticles').height() -100) {
			loadNext(function(){
				$('#articleList .current').next('li').addClass('current');
				$('#articleList .current').first().removeClass('current');
			});
		} else {
			//loadPrevious();
		}
	});

	// Load article links
	var Briefs = loadBriefs(function(){
		getArticle($('#articleList li').first().data('id'));
		$('#articleList li').first().addClass('current');
	});


	$('#articleList').on('click', '.articleLink a', function(evt){
		evt.preventDefault();
		$('#fullArticles').empty();
		var id = jQuery(this).parent().data('id');
		//getArticle(id);
	});

});