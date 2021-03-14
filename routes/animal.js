var express = require('express');
var router = express.Router();
var pool = require('../database/pool');
var moment = require('moment');

router.get('/register', async function (req, res, next) {
    try {
        if (req.user == undefined) {
            return res.redirect('/user/login')
        } else {
            return res.render('register');
        }
    } catch(e){
        return next(e);
    }
})

router.post('/register', async function (req, res, next) {
    try {
        var parent = req.body.parent;
        if (parent=="" || parent == null) {
            parent = null
        }
        var type = req.body.type;
        var name = req.body.name;
        const userId = req.user.userId;
        var [rows] = await pool.query("insert into animal(type, parent,name, user_id) values (?,?,?,?)", [type, parent, name, userId]);
        return res.redirect('/animal/register');
    } catch (e) {
        return next(e);
    }

})

router.get('/delete', async function (req, res, next) {
    try {
        if (req.user == undefined) {
            return res.redirect('/user/login')
        } else {
            return res.render('delete');
        }
        
    } catch (e) {
        return next(e);
    }
})

router.post('/delete', async function (req, res, next) {
    try {
        const userId = req.user.userId;
        const { animalId } = req.body;

        var [rows] = await pool.query("update animal set deleted_at = now() where user_id = ? and id = ?", [userId, animalId]);
        return res.redirect('/animal/delete')
    } catch (e) {
        return next(e);
    }
})

router.get('/ransom', async function (req, res, next) {
    try {
        if (req.user == undefined) {
            return res.redirect('/user/login')
        }
        const userId = req.user.userId;
        var [cowRansom] = await pool.query("select price from price_tag where user_id=? and type='cow';", [userId]);
        var [pigRansom] = await pool.query("select price from price_tag where user_id=? and type='pig';", [userId]);
        var [goatRansom] = await pool.query("select price from price_tag where user_id=? and type='goat';", [userId]);
        var [sheepRansom] = await pool.query("select price from price_tag where user_id=? and type='sheep';", [userId]);

        data = {};
        if(cowRansom.length==0) {
            data.cow = 0;
        } else {
            data.cow = cowRansom[0].price;
        }
        if(sheepRansom.length ==0) {
            data.sheep = 0;
        } else{
            data.sheep = sheepRansom[0].price;
        }
        if(goatRansom.length ==0) {
            data.goat = 0;
        } else{
            data.goat = goatRansom[0].price;
        } if(pigRansom.length==0) {
            data.pig =0;
        } else{
            data.pig = pigRansom[0].price;
        }
        
        
        
        
        return res.render('ransom', {data: data});
    } catch (e) {
        return next(e);
    }
})

router.post('/ransom', async function (req, res, next) {
    try {
        if (req.user == undefined) {
            return res.redirect('/user/login')
        }
        const { cow, pig, goat, sheep } = req.body;
        const userId = req.user.userId;

        var [cowPriceId] = await pool.query("select id from price_tag where user_id=? and type='cow';", [userId]);
        var [pigPriceId] = await pool.query("select id from price_tag where user_id=? and type='pig';", [userId]);
        var [goatPriceId] = await pool.query("select id from price_tag where user_id=? and type='goat';", [userId]);
        var [sheepPriceId] = await pool.query("select id from price_tag where user_id=? and type='sheep';", [userId]);
        if (cowPriceId.length == 0) {
            //해당 기록 없으면 Insert
            var [cowPrice] = await pool.query("insert into price_tag(user_id, type, price) values(?,?,?) on duplicate key update user_id=?, type=?, price=?", [userId, "cow", cow, userId, "cow", cow]);
        } else {
            //있으면 업데이트
            var [cowPrice] = await pool.query("insert into price_tag(id,user_id, type, price) values(?,?,?,?) on duplicate key update id=?, user_id=?, type=?, price=?", [cowPriceId[0].id, userId, "cow", cow, cowPriceId[0].id, userId, "cow", cow]);
        }
        if (pigPriceId.length == 0) {
            //해당 기록 없으면 Insert
            var [pigPrice] = await pool.query("insert into price_tag(user_id, type, price) values(?,?,?) on duplicate key update user_id=?, type=?, price=?", [userId, "pig", pig, userId, "pig", pig]);
        } else {
            var [pigPrice] = await pool.query("insert into price_tag(id,user_id, type, price) values(?,?,?,?) on duplicate key update id=?, user_id=?, type=?, price=?", [pigPriceId[0].id, userId, "pig", pig, pigPriceId[0].id, userId, "pig", pig]);
        }
        if (goatPriceId.length == 0) {
            var [goatPrice] = await pool.query("insert into price_tag(user_id, type, price) values(?,?,?) on duplicate key update user_id=?, type=?, price=?", [userId, "goat", goat, userId, "goat", goat]);
        } else {
            var [goatPrice] = await pool.query("insert into price_tag(id,user_id, type, price) values(?,?,?,?) on duplicate key update id=?, user_id=?, type=?, price=?", [goatPriceId[0].id, userId, "goat", goat, goatPriceId[0].id, userId, "goat", goat]);
        }
        if (sheepPriceId.length == 0) {
            var [sheepPrice] = await pool.query("insert into price_tag(user_id, type, price) values(?,?,?) on duplicate key update user_id=?, type=?, price=?", [userId, "sheep", sheep, userId, "sheep", sheep]);
        } else {
            var [sheepPrice] = await pool.query("insert into  price_tag(id,user_id, type, price) values(?,?,?,?) on duplicate key update id=?, user_id=?, type=?, price=?", [sheepPriceId[0].id, userId, "sheep", sheep, sheepPriceId[0].id, userId, "sheep", sheep]);
        }
        return res.redirect('/');
    } catch (e) {
        return next(e);
    }
})

router.get('/feed/price', async function (req, res, next) {
    try {
        if (req.user == undefined) {
            return res.redirect('/user/login')
        }
        var userId = req.user.userId;

        var [cowFeedPrice] = await pool.query("select price from feed where user_id=? and type='cow';", [userId]);
        var [pigFeedPrice] = await pool.query("select price from feed where user_id=? and type='pig';", [userId]);
        var [goatFeedPrice] = await pool.query("select price from feed where user_id=? and type='goat';", [userId]);
        var [sheepFeedPrice] = await pool.query("select price from feed where user_id=? and type='sheep';", [userId]);
        data = {};
        data = {};
        if(cowFeedPrice.length==0) {
            data.cow = 0;
        } else {
            data.cow = cowFeedPrice[0].price;
        }
        if(sheepFeedPrice.length ==0) {
            data.sheep = 0;
        } else{
            data.sheep = sheepFeedPrice[0].price;
        }
        if(goatFeedPrice.length ==0) {
            data.goat = 0;
        } else{
            data.goat = goatFeedPrice[0].price;
        } if(pigFeedPrice.length==0) {
            data.pig =0;
        } else{
            data.pig = pigFeedPrice[0].price;
        }
        return res.render('feedPrice', {data: data});
    } catch (e) {
        return next(e);
    }
})

router.post('/feed/price', async function (req, res, next) {
    try {
        if (req.user == undefined) {
            return res.redirect('/user/login')
        }
        const { cow, pig, goat, sheep } = req.body;
        const userId = req.user.userId;
        
        var [cowFeedId] = await pool.query("select id from feed where user_id=? and type='cow';", [userId]);
        var [pigFeedId] = await pool.query("select id from feed where user_id=? and type='pig';", [userId]);
        var [goatFeedId] = await pool.query("select id from feed where user_id=? and type='goat';", [userId]);
        var [sheepFeedId] = await pool.query("select id from feed where user_id=? and type='sheep';", [userId]);
        if (cowFeedId.length == 0) {
            //해당 기록 없으면 Insert
            var [cowFeedPrice] = await pool.query("insert into feed(user_id, type, price) values(?,?,?) on duplicate key update user_id=?, type=?, price=?", [userId, "cow", cow, userId, "cow", cow]);
        } else {
            //있으면 업데이트
            var [cowFeedPrice] = await pool.query("insert into feed(id,user_id, type, price) values(?,?,?,?) on duplicate key update id=?, user_id=?, type=?, price=?", [cowFeedId[0].id, userId, "cow", cow, cowFeedId[0].id, userId, "cow", cow]);
        }
        if (pigFeedId.length == 0) {
            //해당 기록 없으면 Insert
            var [pigFeedPrice] = await pool.query("insert into feed(user_id, type, price) values(?,?,?) on duplicate key update user_id=?, type=?, price=?", [userId, "pig", pig, userId, "pig", pig]);
        } else {
            var [pigFeedPrice] = await pool.query("insert into feed(id,user_id, type, price) values(?,?,?,?) on duplicate key update id=?, user_id=?, type=?, price=?", [pigFeedId[0].id, userId, "pig", pig, pigFeedId[0].id, userId, "pig", pig]);
        }
        if (goatFeedId.length == 0) {
            var [goatFeedPrice] = await pool.query("insert into feed(user_id, type, price) values(?,?,?) on duplicate key update user_id=?, type=?, price=?", [userId, "goat", goat, userId, "goat", goat]);
        } else {
            var [goatFeedPrice] = await pool.query("insert into feed(id,user_id, type, price) values(?,?,?,?) on duplicate key update id=?, user_id=?, type=?, price=?", [goatFeedId[0].id, userId, "goat", goat, goatFeedId[0].id, userId, "goat", goat]);
        }
        if (sheepFeedId.length == 0) {
            var [sheepFeedPrice] = await pool.query("insert into feed(user_id, type, price) values(?,?,?) on duplicate key update user_id=?, type=?, price=?", [userId, "sheep", sheep, userId, "sheep", sheep]);
        } else {
            var [sheepFeedPrice] = await pool.query("insert into feed(id,user_id, type, price) values(?,?,?,?) on duplicate key update id=?, user_id=?, type=?, price=?", [sheepFeedId[0].id, userId, "sheep", sheep, sheepFeedId[0].id, userId, "sheep", sheep]);
        }



        return res.redirect('/');
    } catch (e) {
        return next(e);
    }
})

router.get('/children', async function (req, res, next) {
    try {
        return res.render('children');
    } catch (e) {
        return next(e);
    }
})

router.post('/children', async function(req, res, next) {
    try {
        const {animalId} = req.body;
        var [animalName] = await pool.query("select name from animal where id = ? and deleted_at is null", [animalId]);
        var [checkChildren] = await pool.query("select * from animal where parent = ? and deleted_at is null", [animalId]);
        checkChildren.map(children=> children.created_at = moment(children.created_at).format("YYYY-MM-DD"));
        return res.render('childrenResult', {data: checkChildren, value: animalId, name: animalName[0].name});
    } catch (e) {
        return next(e);
    }
})
module.exports = router;
