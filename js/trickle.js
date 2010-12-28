var Trickle = {
	_keywords:null,
	_ws:'http://search.twitter.com/search?q={keywords}&refresh=true&since_id={since_id}&callback=?',
	_sinceId:0,
	_tweets:null,
	_uiTweets:null,
	w:0,//Doc width
	h:0,//Doc height
	i:0,
	PROD:false,
	
	init:function(){
		$('.iForm').bind('submit',$.proxy(this.onSubmit, this));
		var $doc = $(document);
	
		this.w = $doc.width();
		this.h = $doc.height();
		this._setCSSSize();
		
		this._uiTweets = $('.tweets');
		
		//Compile the template
		$( "#tweetTemplate" ).template( "tweetTpl" );
		//debug
		//$('.iForm').submit();
		
		window.onorientationchange = function() {
			var $doc = $doc = $(document);
			Trickle.w = $doc.width();
			Trickle.h = $doc.height();
			Trickle._setCSSSize();
		}
	},
	
	_setCSSSize:function(){
		if($('#headCssSize').length >= 1){
			$('#headCssSize').remove();
		}
		
		$(document).find('head').append('<style id="headCssSize" type="text/css">.tweets ul{width:'+this.w*2+'px;height:'+this.h+'px}.tweets ul li{width:'+this.w+'px;height:'+this.h+'px}</style>');
	},
	
	debug:function(){
		if(!this.PROD)
			return;
		
		console.debug(arguments);
	},
	
	onSubmit:function(e){
		e.preventDefault();
		this._keywords = $.trim($('#twitter_keyworks').val());
		
		if(!this._keywords || this._keywords == null){
			alert('Please fill all the fields.');
			return;
		}
		
		$('.iForm').hide();
		$('.tweets ul').show();
		
		this.getTweets();
	},
	
	getTweets:function(){
		this.i = 0;

		$.ajax({
			url: this._ws
					.replace('{keywords}', encodeURIComponent(this._keywords))
					.replace('{since_id}', this._sinceId),
			dataType: 'json',
			success: $.proxy(_onSuccess, this),
			error:function(XMLHttpRequest, textStatus, errorThrown){
				alert('Twitter API Error: '+ textStatus);
			}
		});
		
		function _onSuccess(data){
			this._sinceId = data.since_id;	
			window.data = data;
			if(data.results.length > 1){	
				this.debug('data Ok', data);
				this._tweets = data.results;
				this._preloadNextTweet();
				this.nextTweet();
			} else {
				//Attendre X secondes avant de redemander les tweets
				if(this._tweets == null){
					alert('Nothing found. Try another keywords');
					$('.iForm').show();
					$('.tweets ul').hide();
					return;
				}
				var ctx = this;
				setTimeout(function(){ctx.getTweets();}, 5000);
			}
		}
		
	},
	
	//Charge dans le second LI le tweet
	_preloadNextTweet:function(){
		if(!this._tweets[this.i]){
			return false;
		}
		
		this._uiTweets.find('li:last').html($.tmpl("tweetTpl", {
			text:this._tweets[this.i].text,
			screen_name:this._tweets[this.i].from_user
		}));
		
		this.i++;
		
		return true;
	},
	
	_replaceTweet:function(){
		var $ul = $('.tweets ul');
		$ul.find('li:first').detach().appendTo($ul);
		$('.tweets ul').css('margin-left', 0);
	},
	
	nextTweet:function(){
		$('.tweets ul').animate({marginLeft:'-'+this.w+'px'}
								,{duration: 1000, easing: "easeOutExpo" });
		
		if(!this._preloadNextTweet()){
			this.getTweets();
			return;
		}
		
		var ctx = this;
		setTimeout(function(){
			ctx._replaceTweet();
			ctx.nextTweet();
		}, 9000);
	}
};