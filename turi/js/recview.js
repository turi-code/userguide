$(document).ready( function(event){
  // Loads Predictive Service client
  // once it loads it triggers the recommenderView function
  function loadScript(url) {
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) {  //IE
      script.onreadystatechange = function(){
        if (script.readyState == "loaded" ||
            script.readyState == "complete"){
          script.onreadystatechange = null;
          recommenderView();
        }
      };
    } else {  //Others
      script.onload = recommenderView;
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  // Snowplow function to get id from cookie
  function getSnowplowDuid(cookieName) {
    cookieName = cookieName || '_sp_';
    var matcher = new RegExp(cookieName + 'id\\.[a-f0-9]+=([^;]+);');
    var match = document.cookie.match(matcher);
    if (match && match[1]) {
      return match[1].split('.')[0];
    } else {
      return -1;
    }
  }

  function recommenderView() {

    // function to construct element tree for recommender view
    // if resp.data.response array is empty it skips creating recommender section
    function renderView(err, resp) {

      // cb event for mouse over event
      // tracks when user first hovers over recommender section
      // sends feedback with data
      function handleView(event) {

        // once we know the schema for what to send back on mouseOver the recommendations
        // uncomment code and set data
        var data = {
          viewed: 1
        };
        client.feedback(resp.data.uuid, data, function(err, resp) {
          if(err) {
            console.log(err);
          }
        });
      }

      // onClick event for links in recommender list.
      // Parameters:
      // * uuid: an identifier for the request with these recommendations
      // * itemId: clicked item, which is a URL that they want to visit.
      // Calls feedback function in PS client to log this event.
      function onClick(uuid, itemId) {

        // Calls client feedback function and sends uuid and feedbackData
        var data = {
          itemId: itemId,
          click: 1
        };
        client.feedback(uuid, data, function(err, resp) {
          if(err) {
            console.log(err);
          }
          window.location.assign(itemId);
        });
      }

      function handleClick(event){
        event.preventDefault();
        var uuid = resp.data.uuid;
        var itemId = event.target.href;
        onClick(uuid, itemId);
      }

      if(err) {
        console.log(err);
        return;
      }

      if(resp.data.response.length){
        const section = document.createElement('section');
        section.id = 'recview';
        section.className = 'normal';
        const h2 = document.createElement('h3');
        h2.innerText = 'Recommended Resources';
        const root = document.createElement('div');
        root.id = 'recroot';
        const list = document.createElement('ul');
        list.id = 'reclist';

        root.appendChild(list);
        section.appendChild(h2);
        section.appendChild(root);
        $('#section-').after(section);

        resp.data.response.forEach(function(element, idx) {
          var listEl = document.createElement('li');
          var link = document.createElement('a');
          link.className = 'recommendation';
          link.href = element.page_url;
          link.innerText = element.title;
          link.addEventListener('click', handleClick);
          listEl.appendChild(link);
          document.getElementById('reclist').appendChild(listEl);
        });

        $( 'ul#reclist' ).one( "mouseover", handleView );
      }
    }

    // gets snowplowId from cookie and constructs url to send in query
    // Once we have schema for data sent in query to endpoint we need to add snowplowId
    var snowplowId = getSnowplowDuid();

    // Construct full URL using the window's pathname.
    var url = window.location.pathname;
    if (url.indexOf('_book') != -1) {
      url = url.split('_book').pop();
    }
    url = 'https://turi.com/learn/userguide' + url;

    const data = {
      query: url,
      user: snowplowId,
      k: 5
    };

    // Initialize PS Client
    var client = new PredictiveServiceClient('https://userguide-recommender.dato.com',
    '078b4189-96cd-4329-87a2-20967a751bf3');

    //Query PS Client
    client.query('userguide-recommender', data, renderView);
  }

  loadScript('https://static.turi.com/products/Turi-Predictive-Services/predictive-service-client/ps-client.js');
});
