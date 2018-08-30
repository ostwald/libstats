
var Menu = Class.extend ({
    init: function (root) {
        this.$root = $(root);
        log ("MENU instantiated");
        this.items = [
            new MenuItem(this, 'General Access', 'access.html'),
            new MenuItem(this, '% Remote Traffic', 'hosts.html'),
            new MenuItem(this, 'OpenSky Downloads', 'opensky_downloads.html'),
            new MenuItem(this, 'Raw Stats', 'https://webstats.ucar.edu/'),
        ]
        var self = this;
        log ("Pathname: " + window.location.pathname)
        $(this.items).each(function (i, item) {
            self.$root.append(item.render())
            log ("item: " + item.dest);
        })
    }
});

var MenuItem = Class.extend ({
    init: function (menu, display, dest) {
        this.menu = menu;
        this.dest = dest;
        this.display = display;
    },
    render: function () {
        var $cell = $t('td')
            .html(this.display);

        if (window.location.pathname.indexOf(this.dest) != -1) {
            $cell.addClass ('current');
        } else {
            var self = this;
            $cell
                .addClass('active')
                // .click(function () {
                //     log(self.dest)
                //     window.location = self.dest;
                // })
                .html ($t('a')
                    .attr('href', this.dest)
                    .html(this.display))
        }
        return $cell;
    }
});