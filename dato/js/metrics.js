(function() {
  /* Dato metrics config */
  var config = (function() {
    if (location.hostname === 'dato.com') {
      return {
        metrics_endpoint: 'd2jgqt121dlkm0.cloudfront.net',
        cookie_domain: '.dato.com'
      };
    } else if (location.hostname === '10.10.2.2') {
      return {
        metrics_endpoint: 'd1f8l5ugmptcv4.cloudfront.net',
        cookie_domain: '10.10.2.2'
      };
    } else {
      // localhost
      return {
        metrics_endpoint: 'dwdqr980l863n.cloudfront.net',
        cookie_domain: 'localhost'
      };
    }
  })();

  /* snowplow analytics */
  ;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
  p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)
  };p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
  n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,"script","//d1fc8wv8zag5ca.cloudfront.net/2.1.1/sp.js","sp_client"));

  /* google analytics */
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  /* hubspot analytics */
  (function(d,s,i,r) {
    if (d.getElementById(i)){return;}
    var n=d.createElement(s),e=d.getElementsByTagName(s)[0];
    n.id=i;n.src='//js.hs-analytics.net/analytics/'+(Math.ceil(new Date()/r)*r)+'/426799.js';
    e.parentNode.insertBefore(n, e);
  })(document,"script","hs-analytics",300000);

  sp_client("newTracker", "cf", config.metrics_endpoint, {
      appId: "dato.com",
      platform: "web",
      cookieDomain: config.cookie_domain,
      contexts: {
        performanceTiming: true,
        gaCookies: true
      }
  });
  sp_client('enableLinkClickTracking', null /*filter*/, true /*pseudoClicks*/, true /*content*/);
  sp_client('enableFormTracking');

  /* modified ga tracking code to enable cross linking */
  ga('create', 'UA-43241412-2', 'auto', {'allowLinker': true});
  ga('require', 'linker');
  ga('linker:autoLink', ['dato.com'] );

  /* record page view in snowplow and ga */
  sp_client('trackPageView');
  ga('send', 'pageview');

  /**
   * This is the section to add event listeners to all link clicks within the 
   * page. All link clicks events are recorded under the category "link". 
   * 
   * Page Header:
   *     - Action (String): 'click_header'
   *     - Label (String): string of internal/external link
   *     - Value (Integer): the N-th appeareance of this link in header. ex: 0, 1, ... 
   *  
   * Page Body:
   *     - Action (String): 'click_body'
   *     - Label (String): string of internal/external link
   *     - Value (Integer): the N-th appeareance of this link in body. ex: 0, 1, ... 
   *
   * Page Footer:
   *     - Action (String): 'click_footer'
   *     - Label (String): string of internal/external link
   *     - Value (Integer): the N-th appeareance of this link in footer. ex: 0, 1, ... 
   *
  **/
  function trackEvent(category, action, label, value) {
    sp_client('trackStructEvent', category, action, label, undefined, value);
    ga('send', 'event', category, action, label, value);
  }
  function trackLink(action, href, value, evt) {
    ga('send', 'event', 'link', action, href, value);
  }
  document.addEventListener("DOMContentLoaded", function(evt) { 
    // default case -- just track everything as "body"
    var links = {
      body: document.body.getElementsByTagName('a')
    };
    
    var headerElements = document.getElementsByClassName('cml-navbar');
    var body = document.getElementById('content-body');
    var footerElements = document.getElementsByTagName('footer');
    if (headerElements.length === 1 &&
        footerElements.length === 1 &&
        body !== null) {
      // matches Dato.com site template
      links = {
        body: body.getElementsByTagName('a'),
        header: headerElements[0].getElementsByTagName('a'),
        footer: footerElements[0].getElementsByTagName('a')
      };
    }

    // get all 'a' tag elements within each
    Object.keys(links).forEach(function(section) {
      var links_map = {};
      for (var i=0; i<links[section].length; i++) {
        var link = links[section][i];
        var hr = link.getAttribute('href');
        if (hr in links_map) {
          links_map[hr] += 1;
        } else {
          links_map[hr] = 0;
        }
        link.addEventListener("click", trackLink.bind(null, 'click_' + section, hr, links_map[hr]));
      }
    });
  });
})();
