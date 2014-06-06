(function($, _, Backbone) {

    var TinyPlayer = Backbone.View.extend({
        className: "tiny-player",

        template: _.template([
            "<div class='player row'>player</div>",
            "<div class='play-list row'>",
            "    <h1>Play List</h1>",
            "    <ul></ul>",
            "</div>",
            "<div class='search-result row'>",
            "    <h1>Search Result</h1>",
            "    <ul></ul>",
            "</div>",
            "<div class='search row'><input placeholder='Search Songs' class='search-input'/><button>Search</button></div>",
        ].join("")),

        searchItemTemplate: _.template([
            "<li><%= track.title %></li>"
        ].join("")),

        plItemTemplate: _.template([
            "<li><%= track.title %></li>"
        ].join("")),

        events: {
            "click .play-list ul li": "handlePlayListAdd",
            "click .search-result ul li": "handlePlayListAdd",
            "click .search button": "handleSearch",
            "change .search input": "handleSearch",
        },

        initialize: function(opts) {
            this.sc = SC.initialize({
                client_id: opts.scClientId
            });

            this.searchResult = [];
        },

        render: function() {
            this.$el.append(this.template());
            this.$(".search-result").hide();
        },

        // event handlers

        handlePlayListAdd: function(event) {
            var track = $(event.target).data("tinyPlayerTrack");
            var plItem = $(this.plItemTemplate({track: track}));
            plItem.data("tinyPlayerTrack", track);
            this.$(".play-list ul").append(plItem);
        },

        handleSearch: function() {
            var query = this.$(".search input").val();
            this.sc.get("/tracks", {q: query}, _.bind(function(tracks) {
                if(tracks.length) {
                    this.$(".search-result").show();
                } else {
                    this.$(".search-result").hide();
                }
                var list = this.$(".search-result ul");
                list.empty();
                for(var i = 0;i < tracks.length;i++) {
                    var item = $(this.searchItemTemplate({track: tracks[i]}));
                    item.data("tinyPlayerTrack", tracks[i]);
                    list.append(item);
                }
            }, this));
        }
    });

    window.TinyPlayer = TinyPlayer;

})(jQuery, _, Backbone);
