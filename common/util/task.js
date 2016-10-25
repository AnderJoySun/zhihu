var CronJob = require('cron').CronJob;
var CONFIG = require('../../config');
var zhAPI = require('../api/index-promise');
var Spider = require('./spider');
var DateCalc = require('./date');


// ============== BAE node-log ==============
if(CONFIG.log.openBae){
    var logger = console;
}else {
    var logger = require('log4js').getLogger('cheese');
}

var Task = {
    fire: function(){
        this.hourly();
        this.daily();
        this.weekly();
    },
    // 07:30 - 21:30 每两个小时爬取一次lastest
    hourly: function(){
        new CronJob('00 30 7-21/2 * * *', function(){
            Spider.latest();
        }, function(){
            logger.info('hourly cron-job over')
        }, true, 'Asia/Shanghai');

        // new CronJob('*/20 * * * * *', function(){
        //     Spider.latest();
        // }, function(){
        //     logger.info('hourly cron-job over')
        // }, true, 'Asia/Shanghai');
    },
    // 每天23:30 爬取当天的数据
    daily: function(){
        new CronJob('00 30 23 * * *', function(){
            var date = new DateCalc().after();
            Spider.day(date);
        }, function(){
            logger.info('daily cron-job over @date:' + new Date())
        }, true, 'Asia/Shanghai');
    },
    
    // 每周三、日 00:30 更新前7天的评论点赞数 
    // 从start到end前一天 共7天
    weekly: function(){
        new CronJob('00 30 00 * * 0,3', function(){
            var start = new DateCalc().before(),
                end = new DateCalc().before(8);
            Spider.updateCmtCount(start, end);
        }, function(){
            logger.info('weekly cron-job over ')
        }, true, 'Asia/Shanghai');
    }
}

module.exports = Task;