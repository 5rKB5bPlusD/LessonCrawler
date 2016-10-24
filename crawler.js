var cheerio = require('cheerio');
var charset = require('superagent-charset');
var superagent = require('superagent');
var iconv = require('iconv-lite');
var url = require('url');
var unique = require('array-unique');
var cleanArray = require('clean-array');
var cheerioTableparser = require('cheerio-tableparser');
charset(superagent);

var cookie;
var stuName;

const baseHeaders = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, sdch',
  'Accept-Language': 'zh-CN,zh;q=0.8',
  'Cache-Control': 'max-age=0',
  Connection: 'keep-alive',
  Host: 'jxgl.hziee.edu.cn',
  Referer: 'http://jxgl.hziee.edu.cn/default2.aspx',
  'Upgrade-Insecure-Requests': 1,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'
};

module.exports = function (userInfo, callback) {
  const webUrl = {
    loginUrl: 'http://jxgl.hziee.edu.cn/',
    mainUrl: 'http://jxgl.hziee.edu.cn/xs_main.aspx?xh=' + userInfo.stuID,
    scheduleUrl: 'http://jxgl.hziee.edu.cn/xskbcx.aspx?xh=' + userInfo.stuID
  };
  superagent.post(webUrl.loginUrl)
    .type("form")
    .set(baseHeaders)
    .send({TextBox1: userInfo.stuID})
    .send({TextBox2: userInfo.password})
    .send({__VIEWSTATE: "/wEPDwUKLTY4Mjg3NzI5NGRk+yAaA352cuwlk0iYbcRxiF6UJVc="})
    .send({__EVENTVALIDATION: "/wEWCgL0h9HvCQLs0bLrBgLs0fbZDAK/wuqQDgKAqenNDQLN7c0VAuaMg+INAveMotMNAoznisYGArursYYIsRYr0nH6eJRR4eD1mC6FIuZeuVY="})
    .send({RadioButtonList1: "%D1%A7%C9%FA"})
    .send({Button1: ""})
    .redirects(0)
    .end(function (err, sres) {
      cookie = sres.headers["set-cookie"];
      cookie = cookie[0];

      superagent.get(webUrl.mainUrl)
        .charset('gb2312')
        .set("Cookie", cookie)
        .set(baseHeaders)
        .redirects(0)
        .end(function (mainPageErr, mainPageSres) {
          if (mainPageErr) {
            console.log(mainPageErr);
            callback(mainPageErr,null);
          } else {
            var $ = cheerio.load(mainPageSres.text, {decodeEntities: false});
            var nameArr = $("#xhxm").html().split('');
            nameArr.pop();
            nameArr.pop();
            stuName = nameArr.join("");
            superagent.post(webUrl.scheduleUrl)
              .charset('gb2312')
              .set("Cookie", cookie)
              .set(baseHeaders)
              .set('Referer', webUrl.scheduleUrl)
              .redirects(0)
              .end(function (scheduleErr, scheduleSres) {
                if (scheduleErr) {
                  console.log(scheduleErr);
                } else {
                  var $ = cheerio.load(scheduleSres.text, {decodeEntities: false});
                  cheerioTableparser($);
                  var data = $("#Table1").parsetable();
                  var weekDay = [
                    data[2],
                    data[3],
                    data[4],
                    data[5],
                    data[6]
                  ];
                  for (let i = 0; i < weekDay.length; i++) {
                    weekDay[i] = getOneDayLessonInfo(weekDay[i]);
                  }
                  for (var j = 0; j < 2; j++) {
                    weekDay.push({
                      date: '周末',
                      lesson: []
                    });
                  }
                  var day = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                  var tomorrowDay = day === 6 ? 0 : day + 1;
                  var trueLesson = {
                    today: weekDay[day],
                    tomorrow: weekDay[tomorrowDay]
                  };
                  callback(null,trueLesson);
                }
              });
          }
        })
    });
}


/*
 Util function
 */

function getOneDayLessonInfo(arr) {
  var date = arr.shift();
  var lessonArr = cleanArray(deleteItem(unique(arr), "&nbsp;"));
  return {
    date: date,
    lesson: getLessonDetail(lessonArr)
  }
}

function getLessonDetail(arr) {
  for (let i = 0; i < arr.length; i++) {
    var detailArr = arr[i].split('<br>');
    arr[i] = {
      lessonName: detailArr[0],
      lessonTime: detailArr[1],
      teacher: detailArr[2],
      classRoom: detailArr[3]
    }
  }
  return arr;
}

function deleteItem(arr, item) {
  arr.splice(arr.indexOf(item), 1);
  return arr;
}

