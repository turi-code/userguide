$(document).ready( function(event){
  // Loads Predictive Service client
  // once it loads it triggers the recommenderView function
  function loadScript(url){

      var script = document.createElement("script")
      script.type = "text/javascript";

      if (script.readyState){  //IE
          script.onreadystatechange = function(){
              if (script.readyState == "loaded" ||
                      script.readyState == "complete"){
                  script.onreadystatechange = null;
                  callback();
              }
          };
      } else {  //Others
          script.onload = function(){
              recommenderView();
          };
      }

      script.src = url;
      document.getElementsByTagName("head")[0].appendChild(script);
  }

  loadScript('http://static.dato.com/files/scripts/predictive-service-client/ps-client.js');

  // Snowplow function to get id from cookie
  function getSnowplowDuid(cookieName) {
    cookieName = cookieName || '_sp_';
    var matcher = new RegExp(cookieName + 'id\\.[a-f0-9]+=([^;]+);');
    var match = document.cookie.match(matcher);
    if (match && match[1]) {
      return match[1].split('.')[0];
    } else {
      return false;
    }
  }

  function recommenderView() {

    // function to construct element tree for recommender view
    // if resp.data.response array is empty it skips creating recommender section
    function renderView(err, resp) {
      if(err) {
        console.log(err);
        return;
      }

      if(resp.data.response.length){
        const section = document.createElement('section');
        section.id = 'recview';
        const h2 = document.createElement('h2');
        h2.innerText = 'Recommended Resources';
        const root = document.createElement('div');
        root.id = 'root';
        const list = document.createElement('ul');
        list.id = 'list';

        root.appendChild(list);
        section.appendChild(h2);
        section.appendChild(root);
        $('#section-').after(section);

        function feedback(event){
          event.preventDefault();
          var uuid = resp.data.uuid;
          var itemId = event.target.href;
          onClick(uuid, itemId);
        }
        for (let i in resp.data.response) {
          let listEl = document.createElement('li');
          let link = document.createElement('a');
          link.className = 'recommendation';
          link.href = resp.data.response[i].page_url;
          link.innerText = resp.data.response[i].title;
          link.addEventListener('click', feedback);
          listEl.appendChild(link);

          document.getElementById('list').appendChild(listEl);
        }

        // cb event for mouse over event
        // tracks when user first hovers over recommender section
        // sends feedback with data
        function mouseOverCB(event) {
          console.log(resp.data.uuid);

          // once we know the schema for what to send back on mouseOver the recommendations
          // uncomment code and set data
          var data = {
            'viewed': 1
          };
          client.feedback(resp.data.uuid, { data }, function(err, resp) {
            if(err) {
              console.log(err);
            }
            console.log(resp);
          });
        }
        $( 'ul#list' ).one( "mouseover", mouseOverCB );
      }

      // onClick event for links in recommender list
      // parameters: uuid, and itemId
      // calls feedback funciton in PS client
      function onClick(uuid, itemId) {
        console.log("onClick function");
        console.log(uuid);
        console.log(itemId);
        // Calls client feedback function and sends uuid and feedbackData
        var data = {'itemId': itemId, 'click': 1};
        client.feedback(uuid, { data }, function(err, resp) {
          if(err) {
            console.log(err);
          }
          console.log(resp);
          window.location.replace(itemId);
        });
      }
    }

    // gets snowplowId from cookie and constructs url to send in query
    // Once we have schema for data sent in query to endpoint we need to add snowplowId
    let snowplowId = getSnowplowDuid();

    // TODO: If no snowplotId is found, send -1 as a user id. It would be better
    // if getSnowplowDuid reliably returned a valid user id.
    if (!snowplowId) {
      snowplowId = -1;
    }


    // Construct full URL using the window's pathname.
    let url = window.location.pathname;
    url = url.replace('/learn/userguide/', 'https://dato.com/learn/userguide/');
    if (url.includes('_book')) {
      url = url.split('_book/').pop();
      url = 'https://dato.com/learn/userguide/' + url;
    }

    // Hardcoding url; need to replace with url constant
    // Right now endpoint is not returning recommendations for other pages
    const data = {
      'query': url,
      'user': snowplowId,
      'k': 5
    };

    // Initialize PS Client
    var client = new PredictiveServiceClient('http://chris-userguide-62760213.us-west-2.elb.amazonaws.com',
    'aea65cf8-8386-4369-98ec-f268fd5adcaf');

    //Query PS Client
    client.query('userguide-recommender', data, renderView);
  };
});
