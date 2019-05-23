const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const request = require('request');
// const session = require('express-session');
const User = require('.././models/User');
const Token = require('.././models/Token');
// const flash = require('connect-flash');

const TWO_HOURS = 1000 * 60 * 60 * 2;

const {
    NODE_ENV = 'development',
    SESS_NAME = 'sid',
    SESS_LIFETIME = TWO_HOURS,
    SESS_SECRET = 'ssh!quiet,it\'asecret!',
} = process.env


const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        req.flash('error_msg', '請先登入')
        res.redirect('/user/signin');
    } else {
        next();
    }
}

const redirectProfile = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/user/profile');
    } else {
        next();
    }
}






router.get('/', redirectProfile, (req, res) => {
    res.render('user/user');
});
//註冊

router.get('/signup', redirectProfile, (req, res) => {
    // var msg = '';
    // var dig = sha256.update(msg, 'utf8').digest('hex');
    res.render('user/signup');
});

router.post('/signup', redirectProfile, (req, res) => {
    User.findAll({
        where: {
            email: req.body.email
        }
    })
        .then((data) => {
            if (data.length > 0) {
                req.flash('error_meg', '註冊失敗，email 重複');
                return res.render('user/signup');
            } else {
                const pwd = require('crypto').createHash('sha256').update(req.body.password, 'utf8').digest('hex');
                let form_data = {
                    provider: 'native',
                    name: req.body.name,
                    email: req.body.email,
                    password: pwd
                }
                User.create(form_data)
                    .then(data => {
                        const token = crypto.randomBytes(64).toString('hex');
                        let times = Date.parse(new Date());
                        const token_data = {
                            access_token: token,
                            access_expired: 3600,
                            provider: 'local',
                            user_id: data.id,
                            token_set_time: times
                        }
                        Token.create(token_data)
                            .then(() => {
                                req.flash('success_msg', '註冊成功，請登入');
                                res.redirect('/user/signin');
                            })
                            .catch(err => {
                                req.flash('error_meg', '註冊失敗，請重試' + err);
                                res.redirect('/user/signin');
                            });
                    })
                    .catch(err => {
                        req.flash('error_meg', '註冊失敗，請重試' + err);
                        res.redirect('/user/signin');
                    });
            }
        })
        .catch(err => {
            req.flash('error_meg', '註冊失敗，請重試' + err);
            res.redirect('/user/signin');
        });
});
//登入
router.get('/signin', redirectProfile, (req, res) => {
    res.render('user/signin');
});

router.post('/signin', (req, res) => {
    let body_provider = req.body.provider;
    let fb_token = req.body.access_token;
    //區別登入方式，假如fb_token的樣式是string 
    if (body_provider === 'facebook') {
        request(`https://graph.facebook.com/me?fields=id,name,email&access_token=${fb_token}`, function (error, response) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            let res_fb_data = JSON.parse(response.body);
            console.log("res_fb_data", res_fb_data);
            const fb_token_data = {
                'access_token': req.body.access_token,
                "access_expired": 3600
            }
            const fb_data = {
                'provider': 'facebook',
                'name': res_fb_data.name,
                'email': res_fb_data.email,
                'password': 'null'
            }
            //檢查fb是否登入過，是否已有使用者資料，若有使用者資料就更新token的日期，若沒有就新增進去資料庫和新增token
            User.findAll({
                where: {
                    email: res_fb_data.email
                }
            })
                .then(data => {
                    console.log(data)
                    if (data.length != 1) {
                        //代表沒有新增過此筆email
                        User.create(fb_data)
                            //新增過後再新增token
                            .then(data => {
                                let times = Date.parse(new Date());
                                //後三個0開始為秒數                
                                const token_data = {
                                    access_token: req.body.access_token,
                                    access_expired: 3600,
                                    provider: 'facebook',
                                    user_id: data[0].id,
                                    token_set_time: times
                                }
                                Token.create(token_data)
                                    .then(() => {
                                        res.cookie('token', req.body.access_token);
                                        req.flash('success_msg', '登入成功!');
                                        return res.render('user/user');
                                    })
                                    .catch(err => { 'err: ' + err })
                            })
                            .catch(err => { 'err: ' + err })
                    } else {
                        //已經新增過此筆email 更新token即可
                        let times = Date.parse(new Date());
                        Token.update({
                            access_token: req.body.access_token,
                            access_expired: 3600,
                            provider: 'facebook',
                            token_set_time: times
                        },
                            {
                                where: {
                                    user_id: data.id
                                }
                            })
                            .then(() => {
                                res.cookie('token', req.body.access_token);
                                req.flash('success_msg', 'fb登入成功!');
                                return res.render('user/user');
                            })
                            .catch(err => { 'err:' + err })
                    }
                })
                .catch(err => { console.log('err: ' + err) })
        });
    } else {
        //不是fb註冊 本地端註冊        
        User.findAll({
            where: {
                email: req.body.email
            }
        })
            .then(data => {
                if (data.length == 1) {
                    const pwd = require('crypto').createHash('sha256').update(req.body.password, 'utf8').digest('hex');
                    if (data[0].password == pwd) {
                        const token = crypto.randomBytes(64).toString('hex');
                        let times = Date.parse(new Date());
                        Token.update(
                            {
                                access_token: token,
                                access_expired: 3600,
                                provider: 'local',
                                token_set_time: times
                            },
                            {
                                where: {
                                    user_id: data[0].id
                                }
                            })
                            .then(() => {
                                console.log("after", res.locals.loggedIn);
                                res.locals.loggedIn = true;
                                console.log("be", res.locals.loggedIn);
                                req.session.userId = data[0].id;
                                req.flash('success_msg', '登入成功');
                                return res.redirect('/user/');
                            })
                            .catch((err) => {
                                req.flash('error_msg', '登入失敗, err: ' + err);
                                return res.redirect('/user/signin');
                            })
                    } else {
                        req.flash('error_msg', '密碼錯誤，請重新輸入');
                        return res.redirect('/user/signin');
                    }
                } else {
                    req.flash('error_msg', '無此帳號，請重新輸入');
                    return res.redirect('/user/signin');
                }
            })
    }
});
//token做好了 之後profile要確定token是否一樣 並且時間有沒有超過600000 十分ㄓㄨㄥ 如果超過 就請使用者重新登入 還要寫api出來 資料都有了 放進去就好



router.get('/profile', redirectLogin, (req, res) => {
    if (req.session.userId) {
        User.findOne({
            where: {
                id: req.session.userId
            }
        })
            .then(data => {
                let text = {
                    id: data.id,
                    name: data.name,
                    email: data.email
                }
                return res.render('user/profile', { text: text })
            })
            .catch(err => { 'err: ' + err; })
    } else {
        res.clearCookie(SESS_NAME);
        req.flash('error_msg', '請先登入')
        res.redirect('/user/signin');
    }
});

router.post('/loginout', redirectLogin, (req, res) => {

    req.session.destroy(err => {
        if (err) {
            return res.redirect('/user/profile');
        }
        res.clearCookie(SESS_NAME);
        res.locals.loggedIn = true;
        res.redirect('/user');
    })
})


module.exports = router;