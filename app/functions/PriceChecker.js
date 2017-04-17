var request = require('request');
var prompt = require('prompt');
var pb = require('pushbullet');
var cheerio = require('cheerio');

// Variables
var asin, price, pb_token;
var amzn_url = 'http://www.amazon.co.uk/dp/';
var span_id = '#actualPriceValue';
var check_interval = 60000;

var _this = module.exports = {
    runChecker: function (isbn) {
        if (!error) {
            asin = isbn;
            amzn_url += asin;
            _this.checkPrice();
        }
    },

    checkPrice: function () {
        //       1619630621
        request(amzn_url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(body);
                var priceArray = []
                var types = []

                $('.dp-title-col').children().each(function (i, element) {
                    var a = $(this).prev();
                    var text = a.text().trim();
                    console.log(text);
                    if (text != '')
                    { types.push(text); }
                })
                console.log(types);

                $('.a-text-right.dp-new-col').each(function (i, element) {
                    var a = $(this).prev();
                    var text = a.text().trim();
                    console.log(text)
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
                    console.log(i + " " + types[i] + " " + priceArray[i])
                }
                var jsonArrayString = JSON.stringify(jsonArray);

                res.json({ 'array': jsonArrayString })
            }
            else {
                console.log("Uh oh. There was an error.");
            }
        });

    }
}
