const express = require('express');
const router = express.Router();
const pool = require('../../database/mysql')
const upload = require('../../app/multer');
const cacheProvider = require('../.././cache-provider');
const CACHE_KEY_CAMP = 'CACHE_KEY_CAMP';


// mysql connecting
pool.on('error', function (err) {
    console.log('[mysql error]', err);
});
// mysql setting End

const https = 'https://stylish.wuhsun.com/';
// const http = 'http://localhost:4000/';



router.post('/campaign_form', upload.single('file'), (req, res) => {
    const campaign_data = {
        products_id: req.body.id,
        picture: https + 'uploads/' + req.file.filename,
        story: req.body.story
    }
    pool.getConnection((err, conn) => {
        if (err) throw err;
        const sql = "INSERT INTO campaigns SET ?";
        conn.query(sql, campaign_data, (err) => {
            if (err) throw err;
            conn.release();
            cacheProvider.instance().del(CACHE_KEY_CAMP, (err, count) => {
                if (err) throw err;
                console.log(count);
                res.send('success');
            })
        });
    })

});


module.exports = router;