var listener = {
    listen: function(config, latest_seq){
    
        var self = this;
        
        var http = require('http');
        
        if(!!config.log){
            self._output = function(msg){
                console.log(msg);
            }
        }
    
        if(typeof latest_seq === 'undefined'){
            latest_seq = 0;
        }
        
        var pathOpts = {
            feed: 'continuous',
            heartbeat: config.heartbeat,
            maxsequences: '1',
            since: latest_seq
        };
        
        var req = http.request({
            host: config.host,
            port: config.port,
            path: '/'+config.db+'/_changes/'+self._constructUrlQueryString(pathOpts)
        });
        
        //end the request
        req.end();
        
        //add a listener to the couchdb changes feed for the beginning of a response
        req.on('response', function(response){
            //couchdb changes feed was successfully connected to
            self._output('\nSuccessfully connected to the couchdb changes feed.');
            self._output('Watching for changes...');
            
            //reset the timeout counter to zero
            //opts.timeouts = 0;
            
            //set the encoding of the response to ascii
            response.setEncoding('ascii');
            
            //add a listener to the response for incoming data
            response.on('data', function(chunk){
                
                //process incoming data from couchdb
                //processIncomingData(socket, chunk);
                self._trigger('change', {chunk: chunk});
                
            });
    
            //add a listener to the response for a closed connection (i.e. timeout or server crash)       
            response.on('end', function(response){
            
                self._output('Connection closed.');
                
                //attempt to reopen the connection to the couchdb changes feed
                self._trigger('error', {type: 'connection_closed'});
            
            });
        });
        
        //add a listener to the couchdb changes feed for an error in the connection
        req.on('error', function(error){
        
            self._output('There was an error connecting.');
            
            //run the necessary code for a connection attempt error
            self._trigger('error', {type: 'connection_error'});
        });
    },
    
    //function to construct a url query from an object
    _constructUrlQueryString: function(options){
        //create an empty variable to hold the output
        var output = [];
        
        //loop over the options object and construct the query
        for(var property in options){
            //test if the current property is a property (and not a method)
            if(options.hasOwnProperty(property)){
                //add the current field/value to the output
                output.push(property+'='+encodeURIComponent(options[property]));
            }
        }
        
        //return the output joined together, as a query string
        return '?'+output.join('&');
    },
    
    _output: function(){},
    
    // ---- EVENT HANDLING
    
    _events: {
        change: [],
        error: []
    },
    on: function(event, fn){
        this._events[event].push(fn);
    },
    _trigger: function(event, data){
        var self = this;
        this._events[event].forEach(function(value, index){
            value.call(self, data);
        });
    }
};

module.exports = listener;