const express = require('express');
const router = express.Router();
const cacheProvider = require('.././cache-provider');
const pool = require('../database/mysql')
const CACHE_KEY_CAMP = 'CACHE_KEY_CAMP';
let CACHE_KEY_PROD = 'CACHE_KEY_PROD';

//mysql connecting

pool.on('error', function(err) {
    console.log("[mysql error]",err);
  });
//mysql setting End



function createJsonData(results, color_rows,size_rows,variants_rows,img_rows){
    let obj={};//要把所有資料放進去的object 在return出來
    
    obj.id = results.id;
    obj.title = results.title;
    obj.category = results.category;
    obj.description = results.description;
    obj.price = results.price;
    obj.texture = results.texture;
    obj.wash = results.wash;
    obj.place = results.place;
    obj.note = results.note;
    obj.story = results.story;


    //colors
    let colors ={};
    let color = [];
    for(var j = 0; j < color_rows.length; j++){
        colors = {
            code: color_rows[j].code,
            name: color_rows[j].name
        };
        color.push(colors);
    }
    obj.color = color;
    //colors END

    //size 
    let size = [];
    for(var i = 0; i <size_rows.length; i++){
        size.push(size_rows[i].size);
    }
    obj.size = size;
    //size END

    //variants
    let variants = {};
    let variant = [];
    for(var v =0; v < variants_rows.length; v++){
        variants = {
            color_code:variants_rows[v].color_code,
            size:variants_rows[v].size,
            stock:variants_rows[v].stock
        };
        variant.push(variants);
    }
    obj.variant = variant;

    //variants END

    //main_img
    obj.main_image = "https://d6u0gq2utdlwf.cloudfront.net/uploads/"+results.main_img;
    //main_img END
    
    //img
    let img = [];
        for(let i = 0; i <img_rows.length; i++){
            img.push(
                "https://d6u0gq2utdlwf.cloudfront.net/uploads/"+img_rows[i].url,
                "https://d6u0gq2utdlwf.cloudfront.net/uploads/"+img_rows[i].url2
            );
        }
        obj.images = img;
    //img END

    return obj;
}

function p_query(sql, num,res,paging){
    var finalObj = {};
    var arr = new Array();
    pool.getConnection((err, conn) => {
        if (err) throw err;    
    conn.query(sql,num, (err, results)=>{
        if (err) throw err;
        if(JSON.stringify(results) === '[]'){
            res.send({
                "error": "Invalid token."
              });
        } else {
            for(let i =0; i <results.length; i++){
                const c_sql = "SELECT code, name,products_id FROM color WHERE color.products_id = ?";
                let c_num = results[i].id;
                if (c_num>0){
                    conn.query(c_sql, c_num,(err, color_rows)=>{
                        if (err) throw err;
                        const s_sql = "SELECT size,products_id FROM variants WHERE variants.products_id = ? ORDER BY variants.size";
                        conn.query(s_sql, c_num,(err, size_rows)=>{
                            if (err) throw err;
                            const v_sql = "SELECT color_code,size,stock,products_id FROM variants WHERE variants.products_id = ? ORDER BY variants.size";
                            conn.query(v_sql, c_num,(err, variants_rows)=>{
                                if (err) throw err;
                                const i_sql = "SELECT url,url2,products_id FROM img WHERE img.products_id = ? ";
                                conn.query(i_sql, c_num, (err, img_rows)=>{
                                    if (err) throw err;                                    
                                    arr.push(createJsonData(results[i],color_rows,size_rows,variants_rows, img_rows));
                                    
                                    if(i == results.length-1){                                        
                                        if(results.length != 6){
                                            conn.release();
                                            finalObj.data = arr;
                                            res.send(finalObj);
                                        } else {
                                            conn.release();
                                            finalObj.paging = paging;
                                            finalObj.data = arr;
                                            res.send(finalObj);
                                        }
                                    }
                                });                                
                            });                             
                        });                        
                    });
                }
            }
        } 
    });
  })
}


function p_detail_query(sql, num,res,paging){
    let datails_Obj = {};    
  pool.getConnection((err, conn) => {
    conn.query(sql,num, (err, results)=>{
        if (err) throw err;
        if(JSON.stringify(results) === '[]'){
            res.send({
                "error": "Invalid token."
              });
        } else {
            for(let i =0; i <results.length; i++){
                const c_sql = "SELECT code, name,products_id FROM color WHERE color.products_id = ?";
                let c_num = results[i].id;
                if (c_num>0){
                    conn.query(c_sql, c_num,(err, color_rows)=>{
                        if (err) throw err;
                        const s_sql = "SELECT size,products_id FROM variants WHERE variants.products_id = ? ORDER BY variants.size";
                        conn.query(s_sql, c_num,(err, size_rows)=>{
                            if (err) throw err;
                            const v_sql = "SELECT color_code,size,stock,products_id FROM variants WHERE variants.products_id = ? ORDER BY variants.size";
                            conn.query(v_sql, c_num,(err, variants_rows)=>{
                                if (err) throw err;
                                const i_sql = "SELECT url,url2,products_id FROM img WHERE img.products_id = ? ";
                                conn.query(i_sql, c_num, (err, img_rows)=>{
                                    if (err) throw err;                                
                                    datails_Obj.data = createJsonData(results[i],color_rows,size_rows,variants_rows, img_rows);
                                    if(i == results.length-1){
                                        if(results.length != 6){                                            
                                            cacheProvider.instance_p().set(CACHE_KEY_PROD+num, datails_Obj, (err, success)=>{
                                                if(!err && success){
                                                    conn.release();
                                                    console.log('存值');                                                    
                                                    res.send(datails_Obj);
                                                }
                                            }) 
                                        } else {
                                            datails_Obj.paging = paging;
                                            cacheProvider.instance_p().set(CACHE_KEY_PROD+num, datails_Obj, (err, success)=>{
                                                if(!err && success){
                                                    conn.release();
                                                    console.log('存值');                                                    
                                                    res.send(datails_Obj);
                                                }
                                            })                                            
                                        }
                                    }
                                });
                                
                            });
                             
                        });
                        
                    });
                }
            }
        }  
    });
  })
}

function p_search_query(sql,keyword, num,res,paging){
    var finalObj = {};
    var arr = new Array();
    pool.getConnection((err,conn)=>{
        if (err) throw err;
        conn.query(sql,['%' + keyword + '%', num], (err, results)=>{
            if (err) throw err;
            if(JSON.stringify(results) === '[]'){
                res.send({
                    "error": "Invalid token."
                  });
            } else {
                for(let i =0; i <results.length; i++){
                    const c_sql = "SELECT code, name,products_id FROM color WHERE color.products_id = ?";
                    let c_num = results[i].id;
                    if (c_num>0){
                        conn.query(c_sql, c_num,(err, color_rows)=>{
                            if (err) throw err;
                            const s_sql = "SELECT size,products_id FROM variants WHERE variants.products_id = ? ORDER BY variants.size";
                            conn.query(s_sql, c_num,(err, size_rows)=>{
                                if (err) throw err;
                                const v_sql = "SELECT color_code,size,stock,products_id FROM variants WHERE variants.products_id = ? ORDER BY variants.size";
                                conn.query(v_sql, c_num,(err, variants_rows)=>{
                                    if (err) throw err;
                                    const i_sql = "SELECT url,url2,products_id FROM img WHERE img.products_id = ? ";
                                    conn.query(i_sql, c_num, (err, img_rows)=>{
                                        if (err) throw err;
                                        arr.push(createJsonData(results[i],color_rows,size_rows,variants_rows, img_rows));
                                        if(i == results.length-1){
                                            if(results.length != 6){
                                                conn.release();
                                                finalObj.data = arr;
                                                res.send(finalObj);
                                            } else {
                                                conn.release();
                                                finalObj.paging = paging;
                                                finalObj.data = arr;
                                                res.send(finalObj);
                                            }
                                        }
                                    });
                                    
                                });
                                 
                            });
                            
                        });
                    }
                }
            }  
        });
    });    
}

router.get('/', (req, res)=>{
    res.send('api page');
});

router.get('/products/:path',(req,res)=>{
    const {path} = req.params;
    let {paging} = req.query;
    var num;
    
    num = (paging-1)*6;

    if (path == 'all'){
        //all
        if(paging>0){
            num = (paging)*6;
            paging = parseInt(paging)
            paging += 1;
            const sql = 'SELECT * FROM products ORDER BY id LIMIT ?,6';
            p_query(sql, num, res,paging);
        } else {
            paging = 1
            num = 0;
            const sql = 'SELECT * FROM products ORDER BY id LIMIT ?,6';
            p_query(sql, num, res,paging);
        }
        //all
    } else if(path == 'men'){
        //men
        if(paging>0){
            num = (paging)*6;
            paging = parseInt(paging)
            paging += 1;
            const sql = 'SELECT * FROM products WHERE category=1 ORDER BY id LIMIT ?,6';
            p_query(sql, num, res,paging);
        } else {
            paging = 1
            num = 0;
            const sql = 'SELECT * FROM products WHERE category=1 ORDER BY id LIMIT ?,6';
            p_query(sql, num, res,paging);
        }
        //men
    } else if(path == 'women'){
        //women
        if(paging>0){
            num = (paging)*6;
            paging = parseInt(paging)
            paging += 1;
            const sql = 'SELECT * FROM products WHERE category=2 ORDER BY id LIMIT ?,6';
            p_query(sql, num, res,paging);
        } else {
            paging = 1
            num = 0;
            const sql = 'SELECT * FROM products WHERE category=2 ORDER BY id LIMIT ?,6';
            p_query(sql, num, res,paging);
        }
        //women
    } else if (path == 'accessories'){
        //accessories
        if(paging>0){
            num = (paging)*6;
            paging = parseInt(paging)
            paging += 1;
            const sql = 'SELECT * FROM products WHERE category=3 ORDER BY id LIMIT ?,6';
            p_query(sql, num, res,paging);
        } else {
            paging = 1
            num = 0;
            const sql = 'SELECT * FROM products WHERE category=3 ORDER BY id LIMIT ?,6';
            p_query(sql, num, res,paging);
        }
        //accessories
    } else if(path == 'search'){
        //search
        let {keyword} = req.query;
        if(paging>0){
            num = (paging)*6;
            paging = parseInt(paging)
            paging += 1;
            const sql = 'SELECT * FROM products WHERE title LIKE ? ORDER BY id LIMIT ?,6';
            p_search_query(sql,keyword, num, res,paging);
        } else {
            paging = 1
            num = 0;
            const sql = 'SELECT * FROM products WHERE title LIKE ? ORDER BY id LIMIT ?,6';
            p_search_query(sql,keyword, num, res,paging);
        }
        //search
    } else if (path == 'details'){
        //details
        let {id} = req.query;        
            var num;
            num = id;
            cacheProvider.instance_p().get(CACHE_KEY_PROD+num, (err, val)=>{
                if (err) throw err;            
                if (val == undefined){
                    console.log('CACHE_KEY_PROD 未設置');
                    const sql = 'SELECT * FROM products WHERE id=?';
                    p_detail_query(sql, num, res,paging);
                } else {
                    console.log('CACHE_KEY_PROD有職');
                    res.send(val);
                }
            })


            
        //details
    } else {
        res.send({
            "error": "Invalid token."
          });
    }
})

let camp_Obj = {};    
router.get('/marketing/campaigns', (req,res)=>{
    
    cacheProvider.instance().get(CACHE_KEY_CAMP, (err, val)=>{
        if (err) throw err;
        if(val == undefined){
            pool.getConnection((err, conn)=>{
                const sql = "SELECT * FROM campaigns";
                conn.query(sql, (err, campaigns, fields)=>{
                    conn.release();
                if (err) throw err;
                camp_Obj.data = campaigns;
                cacheProvider.instance().set(CACHE_KEY_CAMP,camp_Obj, (err, success)=>{
                    if(!err && success){
                        res.send(camp_Obj);
                    }                
                });
            });
            })            
        } else {
            console.log('有職');
            res.send(cacheProvider.instance().get(CACHE_KEY_CAMP));
        }
    })
    // if (Object.keys(camp_Obj).length === 0){
    //     if (typeof cache.get('camp_data') != 'object'){
    //     console.log('camp_Obj is 0');
    //     const sql = "SELECT * FROM campaigns";
    //     conn.query(sql, (err, campaigns, fields)=>{
    //         if (err) throw err;
    //         camp_Obj.data = campaigns;
    //         cache.set('camp_data',camp_Obj, (err, success)=>{
    //             if (err) throw err;
    //             res.send(camp_Obj);
    //         });
    //     });
    // } else {
        
    // }
})



module.exports = router;