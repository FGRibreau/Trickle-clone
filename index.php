<?php
//Brrrr User Agent sniffing...
if(!isset($_GET['debug']) && (!strstr($_SERVER['HTTP_USER_AGENT'],'android') && !strstr($_SERVER['HTTP_USER_AGENT'],'iPhone') && !strstr($_SERVER['HTTP_USER_AGENT'],'iPod')))
{
	echo 'Please visit this website using your iPhone/AndroidPhone.<a href="http://fgribreau.com/">Back</a>';
	exit();
}
?><!doctype html>
<html>
<head>
<title>Trickle clone</title>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="apple-touch-icon" href="regular_icon.png" />
<link rel="apple-touch-icon" sizes="114x114" href="retina_icon.png" />
<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Droid+Serif|Arimo:normal,bold">
<link rel="stylesheet" href="trickle.css" type="text/css" media="screen" title="Trickle theme" charset="utf-8">
</head>

<body>
<form action="?" class="iForm" method="get">
	<fieldset>
		<ol>
		<li>
			<label for="twitter_keyworks">Trickle clone</label>
			<input type="text" name="twitter_keyworks" value="" placeholder="Type some keywords/hashtags here" id="twitter_keyworks">
		</li>
		</ol>
		<p class="pSubmit"><input type="submit" value="Submit" class="plasticButton blue" /></p>
		<p class="info">Don't forget to click on the <strong>“+” button</strong> and select the <strong>Add to Home Screen</strong> option.</p>
	</fieldset>
</form>

<div class="tweets">
<ul>
	<li><quote>We are now loading your tweets...</quote><p>@FGRibreau</p></li>
	<li><quote>We are now loading your tweets...</quote><p>@FGRibreau</p></li>
</ul>
</div>

<script id="tweetTemplate" type="text/x-jquery-tmpl">
    <quote>{{html text}}</quote>
	<p>@${screen_name}</p>
</script>

<script type="text/javascript" charset="utf-8" src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
<script type="text/javascript" charset="utf-8" src="http://ajax.microsoft.com/ajax/jquery.templates/beta1/jquery.tmpl.min.js"></script>
<script type="text/javascript" charset="utf-8" src="js/jQuery.easing.1.3.js"></script>
<script type="text/javascript" charset="utf-8" src="js/trickle.js"></script>
<script type="text/javascript" charset="utf-8">
$(function(){
	Trickle.PROD = <?php echo isset($_GET['debug']) ? 'true' : 'false'; ?>;
	Trickle.init();
});</script>
</body>
</html>
