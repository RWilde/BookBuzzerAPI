var request = require('request');
var cheerio = require('cheerio');

// Variables
var asin, price, pb_token;
var span_id = '#actualPriceValue';
var check_interval = 60000;

var _this = module.exports = {

    checkPrice: function (res, asin) {
        //       1619630621
        var amzn_url = 'http://www.amazon.co.uk/dp/';
        amzn_url += asin;

        request(amzn_url, function (error, response, body) {
            if (response.statusCode == 200) {
                var $ = cheerio.load(body);
                var priceArray = []
                var types = []

                $('.dp-title-col').children().each(function (i, element) {
                    var a = $(this).prev();
                    var text = a.text().trim();
                    if (text != '')
                    { types.push(text); }
                })

                $('.a-text-right.dp-new-col').each(function (i, element) {
                    var a = $(this).prev();
                    var text = a.text().trim();
                    text = text.replace("Amazon Price", '!!!');
                    text = text.replace("—", '!!!');

                    if (text != "!!!")
                        priceArray.push(text)
                });

                var jsonArray = []
                for (var i = 0; i < types.length; i++) {
                    var obj = new Object();
                    obj.type = types[i];
                    obj.price = priceArray[i];
                    var jsonString = JSON.stringify(obj);
                    jsonArray.push(obj);
                }
                res.json({ jsonArray })

            }
            else {
                console.log("Uh oh. There was an error. " + amzn_url + " " + response.statusCode);
            }
        });

    }
}
