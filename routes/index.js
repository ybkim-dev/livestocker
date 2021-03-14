var express = require('express');
var router = express.Router();
const pool = require('../database/pool')

/* GET home page. */
router.get('/', async function (req, res, next) {
  isLogin = false
  dashboard = "예시 화면입니다. 로그인 후 이용해주세요!";
  if (req.user) {
    isLogin = true;
    dashboard = "Dashboard";
    const userId = req.user.userId;
    /**
     * DB에서 결과값들 가져오기.
     */

    data = {}
    var [rows] = await pool.query("SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
    /**
     * 현 상황 가져오기.
     */
    var [cowCnt] = await pool.query("select count(*) as cowCnt from animal where user_id = ? and type = ? and deleted_at is null", [req.user.userId, "cow"]);
    var [sheepCnt] = await pool.query("select count(*) as sheepCnt from animal where user_id = ? and type = ? and deleted_at is null", [req.user.userId, "sheep"]);
    var [pigCnt] = await pool.query("select count(*) as pigCnt from animal where user_id = ? and type = ? and deleted_at is null", [req.user.userId, "pig"]);
    var [goatCnt] = await pool.query("select count(*) as goatCnt from animal where user_id = ? and type = ? and deleted_at is null", [req.user.userId, "goat"]);

    var [getCowPrice] = await pool.query("select price from price_tag where user_id = ? and type = ?", [req.user.userId, "cow"]);
    var [getSheepPrice] = await pool.query("select price from price_tag where user_id = ? and type = ?", [req.user.userId, "sheep"]);
    var [getPigPrice] = await pool.query("select price from price_tag where user_id = ? and type = ?", [req.user.userId, "pig"]);
    var [getGoatPrice] = await pool.query("select price from price_tag where user_id = ? and type = ?", [req.user.userId, "goat"]);

    /**
     * 자산가치를 출력해주는 sql으로도 가능하지만 join 문이 너무 많아져서 비교적 가벼운 select 문으로 처리함.
     * select p.type, count(p.id), p.price * count(p.id) as result from animal a
     * inner join price_tag p
     * on a.type = p.type
     * where a.deleted_at is null
     * group by p.type;
     */
    if(getCowPrice.length==0) {
      var cowTotalPrice = 0;
    } else {
      var cowTotalPrice = getCowPrice[0].price * cowCnt[0].cowCnt;
    }
    if (getSheepPrice.length==0) {
      var sheepTotalPrice = 0;
    } else{
      var sheepTotalPrice = getSheepPrice[0].price * sheepCnt[0].sheepCnt;
    }
    if (getPigPrice.length == 0) {
      var pigTotalPrice= 0;
    } else{
      var pigTotalPrice = getPigPrice[0].price * pigCnt[0].pigCnt;
    }
    if (getGoatPrice.length ==0) {
      var goatTotalPrice = 0;
    } else {
      var goatTotalPrice = getGoatPrice[0].price * goatCnt[0].goatCnt;
    }

    data.animalCnt = { cowCnt: cowCnt[0].cowCnt, sheepCnt: sheepCnt[0].sheepCnt, pigCnt: pigCnt[0].pigCnt, goatCnt: goatCnt[0].goatCnt };

    // 화폐 단위로 콤마 찍기.
    var cowValueFormat = cowTotalPrice.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' });
    var sheepValueFormat = sheepTotalPrice.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' });
    var pigValueFormat = pigTotalPrice.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' });
    var goatValueFormat = goatTotalPrice.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' });
    data.animalValue = {
      cowValue: cowTotalPrice,
      cowValueFormatted: cowValueFormat,
      sheepValue: sheepTotalPrice,
      sheepValueFormatted: sheepValueFormat,
      pigValue: pigTotalPrice,
      pigValueFormatted: pigValueFormat,
      goatValue: goatTotalPrice,
      goatValueFormatted: goatValueFormat,
      animalValueFormatted: (cowTotalPrice + sheepTotalPrice + pigTotalPrice + goatTotalPrice).toLocaleString('ko-KR', {style: 'currency', currency: 'KRW'})
    };
    /**
     * 동물 비율 수 가져오기.
     */
    // created_at  11월 이전 출생하고 deleted_at null 이거나 12월 이후에 deleted_At 인 경우. ==> 11월달 가축
    var [lastMonthCowCnt] = await pool.query("select count(*) as cowCnt from animal where user_id = ? and type=? and created_at < ? and (deleted_at is null or deleted_at >= ?) ", [req.user.userId, "cow", '2020-12-01', '2020-12-01']);
    var [lastMonthSheepCnt] = await pool.query("select count(*) as sheepCnt from animal where user_id = ? and type=? and created_at < ? and (deleted_at is null or deleted_at >= ?)", [req.user.userId, "sheep", '2020-12-01', '2020-12-01']);
    var [lastMonthPigCnt] = await pool.query("select count(*) as pigCnt from animal where user_id = ? and type=? and created_at < ? and (deleted_at is null or deleted_at >= ?)", [req.user.userId, "pig", '2020-12-01', '2020-12-01']);
    var [lastMonthGoatCnt] = await pool.query("select count(*) as goatCnt from animal where user_id = ? and type=? and created_at < ? and (deleted_at is null or deleted_at >= ?)", [req.user.userId, "goat", '2020-12-01', '2020-12-01']);

    data.lastAnimalCnt = { cowCnt: lastMonthCowCnt[0].cowCnt, sheepCnt: lastMonthSheepCnt[0].sheepCnt, pigCnt: lastMonthPigCnt[0].pigCnt, goatCnt: lastMonthGoatCnt[0].goatCnt };

    if(getCowPrice.length==0) {
      var cowLastTotalPrice = 0;
    } else {
      var cowLastTotalPrice = getCowPrice[0].price * lastMonthCowCnt[0].cowCnt;
    } 
    if(getSheepPrice.length ==0) {
      var sheepLastTotalPrice = 0;
    } else {
      var sheepLastTotalPrice = getSheepPrice[0].price * lastMonthSheepCnt[0].sheepCnt;
    }
    if(getPigPrice.length ==0 ){
      var pigLastTotalPrice = 0;
    } else {
      var pigLastTotalPrice = getPigPrice[0].price * lastMonthPigCnt[0].pigCnt;
    }
    if(getGoatPrice.length==0) {
      var goatLastTotalPrice=0;
    }else {
      var goatLastTotalPrice = getGoatPrice[0].price * lastMonthGoatCnt[0].goatCnt;
    }

    data.lastAnimalValue = { cowValue: cowLastTotalPrice, sheepValue: sheepLastTotalPrice, pigValue: pigLastTotalPrice, goatValue: goatLastTotalPrice };
    /**
     * 동물별 수익 창출 비율
     */
    var [curAnimalProfit] = await pool.query("select p.type, count(a.id), p.price * count(p.id) - f.price * count(p.id) as result from animal a "
    + "inner join price_tag p "
    + "on a.type = p.type and a.user_id = p.user_id "
    + "inner join feed f "
    + "on a. type = f.type and a.user_id = f.user_id "
    + "inner join user u "
    + "on a.user_id = u.id "
    + "where a.deleted_at is null and a.user_id = ? and a.created_at between ? and ? "
    + "group by p.type;", [userId ,'2020-12-01', '2021-01-01']);


    var [lastAnimalProfit] = await pool.query("select p.type, count(a.id), p.price * count(p.id) - f.price * count(p.id) as result from animal a "
    + "inner join price_tag p "
    + "on a.type = p.type and a.user_id = p.user_id "
    + "inner join feed f "
    + "on a. type = f.type and a.user_id = f.user_id "
    + "inner join user u "
    + "on a.user_id = u.id "
    + "where a.deleted_at is null and a.user_id = ? and a.created_at between ? and ? "
    + "group by p.type;", [userId, '2020-11-01', '2020-12-01']);

    var cowProfit = 0;
    var sheepProfit = 0;
    var pigProfit = 0;
    var goatProfit = 0;
    for (var i = 0; i < lastAnimalProfit.length; i++) {
      if (lastAnimalProfit[i].type == 'cow') {
        cowProfit = lastAnimalProfit[i].result;
      }
      else if (lastAnimalProfit[i].type == 'sheep') {
        sheepProfit = lastAnimalProfit[i].result;
      } else if (lastAnimalProfit[i].type == 'pig') {
        pigProfit = lastAnimalProfit[i].result;
      } else if (lastAnimalProfit[i].type == 'goat') {
        goatProfit = lastAnimalProfit[i].result;
      }
    }
    data.lastAnimalProfit = { cowProfit: cowProfit, sheepProfit: sheepProfit, pigProfit: pigProfit, goatProfit: goatProfit };
    
    var cowProfit = 0;
    var sheepProfit = 0;
    var pigProfit = 0;
    var goatProfit = 0;
    for (var i = 0; i < curAnimalProfit.length; i++) {
      
      if (curAnimalProfit[i].type == 'cow') {
        cowProfit = curAnimalProfit[i].result;
        
      }
      else if (curAnimalProfit[i].type == 'sheep') {
        sheepProfit = curAnimalProfit[i].result;
        
      } else if (curAnimalProfit[i].type == 'pig') {
        pigProfit = curAnimalProfit[i].result;
        
      } else if (curAnimalProfit[i].type == 'goat') {
        goatProfit = curAnimalProfit[i].result;
        
      }
    }

    data.animalProfit = { cowProfit: cowProfit, sheepProfit: sheepProfit, pigProfit: pigProfit, goatProfit: goatProfit };


    res.render('index', { isLogin: isLogin, nickname: req.user.nickname, dashboard: dashboard, data: data });
  }
  else {
    res.render('UnLoginIndex', { isLogin: isLogin, nickname: null, dashboard: dashboard });
  }

});
module.exports = router;
