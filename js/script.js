

var app = {}; // create namespace for our app

//--------------
// Models
//--------------

app.Brief = Backbone.Model.extend({
	defaults: function(){
		return {
			title: '',
			link: '',
			guid: ''
		};
	},

	initialize: function(){
		//console.log('Model accessed');
		//console.log(this);
	}
});

app.Full = Backbone.Model.extend();

//--------------
// Collections
//--------------
app.ArticlesCollection = Backbone.Collection.extend({

	model: app.Brief,
	url: "article.xml",

	parse: function(data) {
		var parsed = [],
			article;


		jQuery(data).find('article').each(function(index){

			article = jQuery(this);

			parsed.push({
				title: article.find('title').text(),
				link: article.find('webLink').text(),
				guid: article.find('guid').text()
			})

		});

		//console.log(parsed);

		return parsed;
	},

	fetch: function (options) {
		options = options || {};
		options.dataType = "xml";
		return Backbone.Collection.prototype.fetch.call(this, options);
	}
});

app.FullArticleCollection = Backbone.Collection.extend({

	initialize: function(options){
		this.id = options;
	},

	url: function(){
		return "anotherurl"+this.id;
	},

	model: app.Full,

	parse: function(data) {
		var parsed = [],
			article;

			//console.log(data)
		jQuery(data).find('article').each(function(index){

			article = jQuery(this);

			parsed.push({
				description: article.find('description').text(),
				fullImage: article.find('fullImage').text()
			})

		});

		//console.log(parsed);

		return parsed;
	},

	fetch: function (options) {
		options = options || {};
		options.dataType = "xml";
		return Backbone.Collection.prototype.fetch.call(this, options);
	}


});

//--------------
// Views
//--------------

// Renders full list of article titles
app.ArticlesList = Backbone.View.extend({
	el: '#articleList',
	tagName: 'article',

	initialize: function(){
		this.model.bind("reset", this.render, this);

	},

	render: function () {
		var i = 0;
		_.each(this.model.models, function(brief){
			$(this.el).append(new app.ArticleTitleView({model: brief}).render(i).el);
			i++;
		}, this);

		return this;
	}
});

// renders individual article title list (li)
app.ArticleTitleView = Backbone.View.extend({

	tagName: 'li',

	template: _.template(jQuery('#article-title-template').html()),

	render: function(i){

        this.$el.html(this.template(this.model.toJSON()));

		if(i === 0){
			this.fullView = new app.FullArticle({model:this.model});
			this.$el.addClass('current');
		}

		return this;
	},

	events: {
		"click .articleTitle": "clickedArticle"
	},

	clickedArticle: function(e) {
		e.preventDefault();
		$('#fullArticles').html("");
		this.brief = jQuery(e.currentTarget).data("id");
		//var guid = jQuery(e.currentTarget).data("id");
		this.fullView = new app.FullArticle({model:this.model});
		//console.log('Brief: ',this.model);
	}

});

app.FullArticle = Backbone.View.extend({
	tagName: 'article',
	el: '#fullArticles',
	template: _.template(jQuery('#full-article-template').html()),

	initialize: function(){
		_.bindAll(this, 'detect_scroll');
		this.model2 = new app.FullArticleCollection(this.model.get('guid'));
		this.model2.bind("reset", this.render, this);
		this.model2.fetch();

		$('#fullArticles').scroll(this.detect_scroll);
	},

	render: function(){
		brief = this.model.toJSON();
		full = this.model2.models[0].attributes;
		article = $.extend(true, {}, brief, full);
		//console.log(article);

		this.$el.append(this.template(article));
	},

	detect_scroll: function(){
		//if(1==1){
			console.log(this.$el.find('current'));
			this.$el.data('article');
		//}
	}

});

var articleList = new app.ArticlesCollection();
var articleListView = new app.ArticlesList({model: articleList});
articleList.fetch();

//new app.ArticleTitleView({collection: arts});
//app.ArticleTitleView().render;
//arts.fetch();
//arts.parse();