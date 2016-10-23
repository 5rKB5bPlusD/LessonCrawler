var API = require('wechat-api');
var wechat = require('wechat');
var config = require('./wx_config');
var getLesson = require('./crawler');

var app_id = config.wx.app_id;
var app_secret = config.wx.app_secret;
var express = require('express');
var mongoose = require('mongoose');
require('./models/User.js');
var User = mongoose.model('User');

var api = new API(app_id, app_secret);

var app = express();
var connConfig = {
  token: 'helloworld',
  appid: app_id,
  encodingAESKey: 'FpZToPuX7eV2KQUYI6bKept60YhSq31RzTgucmJCXf4'
};

app.use(express.query());
app.use('/wechat', wechat(connConfig, wechat.event(function (message, req, res, next) {
  if (message.Event === 'subscribe') {
    res.reply("欢迎关注" + "<a href='www.betahouse.us'>Betahouse工作室</a>" + "\n回复'bind'进行绑定学号信息操作\n回复'课表1'获取今日课表\n回复'课表2'获取明日课表");
  }
})
  .text(function (message, req, res, next) {
    console.log(message.Content);
    var bindMsg = message.Content.split(' ');
    if (message.Content === 'bind') {
      res.reply("请按以下格式发送相关信息以完成绑定('绑定'两字、学号和密码用空格分开)：\n绑定 1590xxxx 123456");
    }

    User.findOne({uid: message.FromUserName}, function (err, user) {
      if (err) {
        return console.log(err);
      }
      if (bindMsg[0] === '绑定') {
        if (!user) {
          var user = new User();
          user.uid = message.FromUserName;
          user.stuID = bindMsg[1];
          user.password = bindMsg[2];
          // 判断学号密码是否正确
          getLesson(user, function (err, flower) {
            if (err) {
              return res.reply("您绑定的账号信息有误:(，请重新绑定");
            } else {
              user.save(function (err, user) {
                if (err) {
                  return console.log(err);
                }
                res.reply("绑定成功!\n回复'课表1'获取今日课表\n回复'课表2'获取明日课表");
              });
            }
          });
        } else {
          res.reply('你已经绑定过学号了哦:)');
        }
      }
      if (message.Content === '课表1' || message.Content === '课表2') {
        if (!user) {
          res.reply("您还未绑定学生账号\n请按以下格式发送相关信息以完成绑定('绑定'两字、学号和密码用空格分开)：\n绑定 1590xxxx 123456");
        } else {
          getLesson(user, function (err, flower) {
            if (err) {
              return res.reply("您绑定的账号信息有误:(，请重新绑定");
            }
            if (message.Content === '课表1') {
              if (!flower.today.lesson.length) {
                res.reply('今天没课哦~');
              } else {
                res.reply("今天" + getLessonStr(flower.today.lesson));
              }
            }

            if (message.Content === '课表2') {
              if (!flower.tomorrow.lesson.length) {
                res.reply('明天没课哦~');
              } else {
                res.reply("明天" + getLessonStr(flower.tomorrow.lesson));
              }
            }
          });
        }
      }
    });
  })));


/**
 *
 * @param arr : today or tomorrow lesson arr
 */
function getLessonStr(arr) {
  var lessonStr = '一共要上' + arr.length + '门课\n\n';
  arr.forEach(function (obj) {
    lessonStr = lessonStr + obj.lessonName + '\n' + obj.lessonTime + '\n教师：' + obj.teacher + '\n教室：' + obj.classRoom
      + '\n--------------\n';
  });
  return lessonStr;
}


module.exports = app;
