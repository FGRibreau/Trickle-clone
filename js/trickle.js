//Quick & Dirty code ! 
//You've been warned !

var Trickle = {
	_keywords:null,
	_ws:'http://search.twitter.com/search.json?q={keywords}&refresh=true&since_id={since_id}&rpp=100&callback=?',
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
	
	firstLoad:true,
	
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
			alert('Please fill all fields.');
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
					.replace('{keywords}', encodeURIComponent(this._keywords+' (twitpic OR yfrog) filter:links'))
					.replace('{since_id}', this.firstLoad ? '' : '&since_id='+this._sinceId),
			dataType: 'json',
			
			success: $.proxy(this.getTweets_onSuccess, this),
			error:function(XMLHttpRequest, textStatus, errorThrown){
				alert('Twitter API Error: '+ textStatus);
			}
		});
		
		this.firstLoad = false;
		
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
  			  
  				alert('Nothing found. Try another keywords (twitter forbid trending topic image search)');
  				$('.iForm').show();
  				this.$tweets.find('ul').hide();
  				
  				return;
  			}
			
  			//Wait 5sec before restarting to request.
  			var ctx = this;
        setTimeout(function(){ctx.getTweets()}, 5000);
  		}
  	},
	
	//Charge dans le second LI le tweet
	_preloadNextTweet:function(){
		if(!this._tweets[this.i]){
			return false;
		}
		
		this._formatTweet(this._tweets[this.i]);
		var $li = this.$tweets.find('li:last');
		
		if(this._tweets[this.i].img){
		  $li.css('backgroundImage', 'url('+this._tweets[this.i].img+')');
		  
		  if(this._tweets[this.i+1] && this._tweets[this.i+1].img){
		    new Image(this._tweets[this.i].img);
		  }
		}
		
		$li.html($.tmpl("tweetTpl", {
			  text:       this._tweets[this.i].text
			, screen_name:this._tweets[this.i].from_user
		}));
		
		this.i++;
		
		return true;
	},
	
	_formatTweet:function(tweet){
	  
	  var txt = tweet.text;
	  
  	txt = this._preg_replace_callback('/(https?\\:\\/\\/[^\\s]*)/ig', function _callback_link(matches){
    	var dom = matches[0].toLowerCase()
    					.replace('http://','')
    					.replace('www.','');

    	return '<a href="'+matches[0]+'">'+dom.substr(0,dom.indexOf('/'))+'</a>';
  	},txt);

  	txt = txt.replace(/(\#[^\s,\.\:\)]*)/ig,'<strong class="st">$1</strong>');
  	txt = txt.replace(/(\@([^\s,\.\:\)\#]*))/ig,'<a href="http://twitter.com/$2" class="twScreenname" alt="$2">$1</a>');
  	
  	//Ajouter une image si possible
  	var $a = $('<div>'+txt+'</div>').find('a');
  	if($a.length > 0){
  	  var toAppend = [];
  	  
  	  $a.each($.proxy(function(index, el){
    	  this._LinkImagePreview.func($(el), tweet, this._LinkImagePreview, toAppend);
    	}, this));
  	}
    
    tweet.text = txt;
    tweet.img = toAppend && toAppend.length > 0 ? toAppend[0] : false;
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
	
	_LinkImagePreview: {
	  
	  _parseUri: (function(){
	    var options = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {
          name:   "queryKey",
          parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
          strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
          loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
      };
      
	    return function(str) {
        var	o  = options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

        while (i--) uri[o.key[i]] = m[i] === "null" ? "" : (m[i] || "");

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
          if ($1) uri[o.q.name][$1] = $2;
        });

        return uri;
      };

      
	    
	  })(),
    
    transformations: {
      standard: function (url) {
        //thumb
        return "http://"+url.host+"/show/medium"+url.path;
      },
      yfrog: function (url) {
        return "http://"+url.host+url.path+":iphone";
      },
      
      "i.imgur.com": function (url) {
        var path = (url.path || "").replace(/(?:.jpg)?$/, "s.jpg");
        return "http://"+url.host+path;
      },
      
      "imgur.com": function (url) {
        return this["i.imgur.com"](url);
      }
    },
    domains: ["img.ly", "twitpic.com", "yfrog", "imgur.com", "i.imgur.com"],
    
    func: function imagePreview(a, tweet, plugin, toAppend) { // a is a jQuery object of the a-tag
      var href = (a.attr("href") || "").replace('http://','').replace('www.','');
      var domains = plugin.domains;
      
      for(var i = 0, len = domains.length; i < len; ++i) {
        var domain = domains[i];
        if(href.indexOf(domain) === 0) {
          var url = plugin._parseUri(href)
          ,   trans = plugin.transformations[domain] || plugin.transformations.standard
          ,   previewURL = trans.call(plugin.transformations, url);

          toAppend.push(previewURL);
        }
      }
    }
  },
  
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