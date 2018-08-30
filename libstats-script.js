
function get_selected_year () {
    var $el = $('input[name=year]:checked');
    return parseInt($el.prop('id').replace('year_',''))
}

function get_selected_field() {
    $el = $('input[name=field]:checked');
    var index = parseInt($el.prop('id').replace('field_',''));
    return FIELD_NAMES[index];
}

function get_selected_hosts() {
    var selected_hosts = [];
    $('input[name=host]:checked').each (function (i, el) {
        var index = parseInt(el.id.replace('host_',''));
        selected_hosts.push (HOSTS[index]);
    })

    if (!selected_hosts.length)
        return HOSTS;

    return selected_hosts;
}

function updateChart () {

    // get selected year
    var year = get_selected_year();

    // get selected field
    var field = get_selected_field();

    var hosts = get_selected_hosts();

    var data_url = 'data/' + DATA_DIR + '/' + year + '_' + field.replace(/ /g, '_') + '.json';
    log (data_url);

    var maxV = $('#max-vaxis').val()
    log ("maxV: " + maxV);

    var url = window.location.href;
    var i = url.indexOf('?');
    if (i != -1) {
        url = url.substr(0, i);
    }

    url = url + '?' + $.param({
            year:parseInt(year) - 2012,
            field:FIELD_NAMES.indexOf(field),
            host:hosts.map(function (h) {
                return HOSTS.indexOf(h);
            })
    })

    $('#display-url').html(decodeURIComponent(url));

    log ("DIsPLAY_URL: " + url);

    $.ajax({
        url: data_url,
        dataType: 'json',
        success: function (result, textStatus, jqXHR) {
//                slog(result);
//             var hosts = get_selected_hosts();
            if (hosts.length != HOSTS.length) {
                log ("FILTER DATA ...")
                result = filterData(result, hosts);
            }
            drawChart (result, field + ' - ' + year, maxV);
        }
    })

}

function filterData(data, hosts) {
    // Filtering data for hosts

    var schema = data[0];
//        log ('SCHEMA: ' + schema);
//        log ("hosts: " + hosts);

    // we need the indices of the columns we will keep
    // schema is list of host names. The keepers are the indexes of the hosts
    // for which we will display data
    var keepers = [0]
    $(schema).each (function (i, host) {
//            log ("looking for " + host)
        if (hosts.indexOf(host) != -1) {
//                log("  - found!")
            keepers.push(i)
        }
    })

    var new_data = []
    $(data).each (function (i, row) {
        var new_row = []
        for (var j=0;j<row.length;j++) {
            if (keepers.indexOf(j) != -1) {
                // Bandwidth is a problem, since it is a string at this point
                // but we want to convert it to float. it is the only graphable value
                // that is represented as a string at this point.
                // row 0 is header - don't change anything
                // column 0 is month (a string) which we leave alone
                var val = row[j];
//                    log (val + ' (' + typeof (val) + ') col: ' + j + ', row: ' + i);
                if (i > 0 && j > 0 && typeof(val) == 'string') {
                    val = parseFloat(val);
                }
                new_row.push(val);
            }
        }
        new_data.push (new_row);
    })
    return new_data;
}

function initializeYearSelector() {
    for (var i=2012; i < 2019;i++) {
        $('#year-selector')
            .append($t('label')
                .attr('for', 'year_' + i)
                .html(i))
            .append($t('input')
                .attr('type', 'radio')
                .attr('name', 'year')
                .attr('id', 'year_' + i))
    }

    $('input[name=year]')
        .checkboxradio()
        .click (function () {
            updateChart();
        })
    $('fieldset#year-selector').controlgroup();

    var selector = '#year_2018'; // default
    if (PARAMS['year']) {
        selector = '#year_'+YEARS[PARAMS['year']]
    } else {
        log ("NO year - using default")
    }

    $(selector)
        .prop('checked', true)
        .checkboxradio( "refresh" );
}

function initializeFieldSelector() {
    $(FIELD_NAMES).each (function (i, field) {
        $('#field-selector')
            .append($t('label')
                .attr('for', 'field_' + i)
                .html(field))
            .append($t('input')
                .attr('type', 'radio')
                .attr('name', 'field')
                .attr('id', 'field_' + i))
    })

    $('input[name=field]')
        .checkboxradio()
        .click (function () {
            updateChart();
        })
    $('fieldset#field-selector').controlgroup();

    var field_index = PARAMS['field'] || 1;

    $('#field_'+field_index)
        .prop('checked', true)
        .checkboxradio( "refresh" );
}

function initializeHostSelector() {
    $(HOSTS).each (function (i, host) {
        $('#host-selector')
            .append($t('label')
                .attr('for', 'host_' + i)
                .html(host))
            .append($t('input')
                .attr('type', 'checkbox')
                .attr('name', 'host')
                .attr('id', 'host_' + i))
    })

    $('input[name=host]')
        .checkboxradio()
        .click (function () {
            updateChart();
        })
    $('fieldset#host-selector').controlgroup();

    var hosts = PARAMS['host[]']
    if (!hosts) {
        hosts = [1]; // default
    }
    else if (hosts && typeof hosts == 'string') {
        hosts = [hosts];
    }

    $(hosts).each(function (i, h) {
        $('#host_' + h)
            .prop('checked', true)
            .checkboxradio( "refresh" );
    })


    //
    //
    // log ('hosts: ' + hosts)
    //
    //
    // $('#host_0')
    //     .prop('checked', true)
    //     .checkboxradio( "refresh" );
}