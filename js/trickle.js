//Quick & Dirty code ! 
//You've been warned !

var Trickle = {
	_keywords:null,
	_ws:'http://search.twitter.com/search?q={keywords}&refresh=true&since_id={since_id}&callback=?',
	_sinceId:0,
	_tweets:null,
	
	//jQUery object cache
	$tweets:null,
	$doc:null,
	
	//Doc width
	w:0,
	//Doc height
	h:0,
	
	i:0,
	
	PROD:false,
	
	init:function(){
	  //Bind the form
		$('.iForm').bind('submit', $.proxy(this.onSubmit, this));
		
		//jQuery cache
		this.$doc = $(document);
		this.$tweets = $('.tweets');
		
		
		this.w = this.$doc.width();
		this.h = this.$doc.height();
		this._UIsetCSSSize();
		
		//Compile the template
		$( "#tweetTemplate" ).template( "tweetTpl" );

    //Bind on "OrientationChange" event
		window.onorientationchange = function() {
			Trickle.w = this.$doc.width();
			Trickle.h = this.$doc.height();
			Trickle._UIsetCSSSize();
		}
	},
	
	onSubmit:function(e){
		e.preventDefault();
		this._keywords = $.trim($('#twitter_keyworks').val());
		
		if(!this._keywords || this._keywords == null){
			alert('Please fill all the fields.');
			return;
		}
		
		$('.iForm').hide();
		this.$tweets.find('ul').show();
		
		this.getTweets();
	},
	
	getTweets:function(){
		this.i = 0;

		$.ajax({
			url: this._ws
					.replace('{keywords}', encodeURIComponent(this._keywords))
					.replace('{since_id}', this._sinceId),
			dataType: 'json',
			
			success: $.proxy(this.getTweets_onSuccess, this),
			error:function(XMLHttpRequest, textStatus, errorThrown){
				alert('Twitter API Error: '+ textStatus);
			}
		});
		
	},
	
	getTweets_onSuccess: function(data){
		this._sinceId = data.since_id;	
		
		if(data.results.length > 1){	
			this._debug('data Ok', data);
			this._tweets = data.results;
			
			this._preloadNextTweet();
			this.nextTweet();
			
		} else {
			
			if(this._tweets == null){
				alert('Nothing found. Try another keywords');
				
				$('.iForm').show();
				this.$tweets.find('ul').hide();
				return;
			}
			
			//Wait 5sec before restarting requests.
			var ctx = this;
			setTimeout(function(){ctx.getTweets();}, 5000);
		}
	},
	
	//Charge dans le second LI le tweet
	_preloadNextTweet:function(){
		if(!this._tweets[this.i]){
			return false;
		}
		
		this.$tweets.find('li:last').html($.tmpl("tweetTpl", {
			  text:       this._formatTweetText(this._tweets[this.i].text)
			, screen_name:this._tweets[this.i].from_user
		}));
		
		this.i++;
		
		return true;
	},
	
	_formatTweetText:function(txt){
	  
  	txt = this._preg_replace_callback('/(https?\\:\\/\\/[^\\s]*)/ig', function _callback_link(matches){
    	var dom = matches[0].toLowerCase()
    					.replace('http://','')
    					.replace('www.','');

    	return '<a href="'+matches[0]+'">'+dom.substr(0,dom.indexOf('/'))+'</a>';
  	},txt);

  	txt = txt.replace(/(\#[^\s,\.\:\)]*)/ig,'<strong class="st">$1</strong>');
  	txt = txt.replace(/(\@([^\s,\.\:\)\#]*))/ig,'<a href="http://twitter.com/$2" class="twScreenname" alt="$2">$1</a>');
    
    return txt;
	},
	
	_UIreplaceTweet:function(){
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
			ctx._UIreplaceTweet();
			ctx.nextTweet();
		}, 9000);
	},
	
	/**
	  
	**/
	_UIsetCSSSize:function(){
		if($('#headCssSize').length >= 1){
			$('#headCssSize').remove();
		}
		
		this.$doc.find('head').append('<style id="headCssSize" type="text/css">.tweets ul{width:'+this.w*2+'px;height:'+this.h+'px}.tweets ul li{width:'+this.w+'px;height:'+this.h+'px}</style>');
	},
	
	/**
	HELPER
	**/
	_ucFirst:function(str){
	  return str.charAt(0).toUpperCase() + str.substr(1);
	},
	
	//Source: https://github.com/FGRibreau/preg_replace---preg_replace_callback-in-javascript
	_preg_replace_callback: function(pattern, callback, subject, limit, count){
  	limit = !limit?-1:limit;

  	var _flag = pattern.substr(pattern.lastIndexOf(pattern[0])+1),
  		_pattern = pattern.substr(1,pattern.lastIndexOf(pattern[0])-1),
  		reg = new RegExp(_pattern,_flag),
  		rs = null,
  		res = [],
  		x = 0,
  		ret = subject;

  	if(limit === -1){
  		var tmp = [];

  		do{
  			tmp = reg.exec(subject);
  			if(tmp !== null){
  				res.push(tmp);
  			}
  		}while(tmp !== null && _flag.indexOf('g') !== -1)
  	}
  	else{
  		res.push(reg.exec(subject));
  	}

  	for(x = res.length-1; x > -1; x--){//explore match
  		ret = ret.replace(res[x][0],callback(res[x]));
  	}
  	return ret;
  },
	
	_debug:function(){
		if(!this.PROD)
			return;
		
		console.debug(arguments);
	}
};