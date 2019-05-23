const express = require('express');
const router = express.Router();
const upload = require('../../app/config/multer.config');
const cacheProvider = require('../.././cache-provider');
const pool = require('../../database/mysql')
const CACHE_KEY_PROD = 'CACHE_KEY_PROD';
const s3 = require('../../app/config/s3.config');

pool.on('error', function (err) {
  console.log("[mysql error]", err);
});

let doupload = (req, res, products_data) => {
  let times = Date.parse(new Date());
  const s3Client = s3.s3Client;
  const params = s3.uploadParams;

  params.Key = times + req.file.originalname
  params.Body = req.file.buffer;

  s3Client.upload(params, (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error -> " + err });
    }
    pool.getConnection((err, conn) => {
      if (err) throw err;
      const sql = "INSERT INTO products SET ?";
      conn.query(sql, products_data, (err) => {
        conn.release();
        if (err) throw err;
        cacheProvider.instance().del(CACHE_KEY_PROD, (err, count) => {
          if (err) throw err;
          console.log("admin add some product:");
          console.log(count);
          res.redirect('/admin/product/2');
        })
      });
    })
  });
}

let douploads = (req, res) => {
  let times = Date.parse(new Date());
  const s3Client = s3.s3Client;
  const params = s3.uploadParams;
  for (let i = 0; i < 2; i++) {
    params.Key = times + req.files[i].originalname
    params.Body = req.files[i].buffer;
    s3Client.upload(params, (err, data) => {
      if (err) {
        res.status(500).json({ error: "Error -> " + err });
      }
    });
  }
}


router.get('/', (req, res) => {
  res.render('admin/product');
});

router.get('/manage', (req, res) => {
  res.render('admin/manage');
})

router.post('/admin_product_add', upload.single('file'), (req, res) => {
  let times = Date.parse(new Date());
  const products_data = {
    title: req.body.title,
    category: req.body.itemCategory,
    description: req.body.description,
    price: req.body.price,
    texture: req.body.texture,
    wash: req.body.wash,
    place: req.body.place,
    note: req.body.note,
    story: req.body.story,
    main_img: times + req.file.originalname
  }
  console.log(products_data);
  doupload(req, res, products_data);
});

router.get('/2', (req, res) => {
  pool.getConnection((err, conn) => {
    if (err) throw err;
    const sql = "SELECT * FROM products";
    conn.query(sql, (err, rows, fields) => {
      conn.release();
      if (err) throw err;
      res.render('admin/product_2', {
        title: 'Admin Product page -2',
        productName: rows
      });
    });
  });
});

router.post('/admin_product_add_2', (req, res) => {
  const color_data = {
    code: req.body.code,
    name: req.body.name,
    products_id: req.body.itemName
  }
  pool.getConnection((err, conn) => {
    if (err) throw err;
    const sql = "INSERT INTO color SET ?";
    conn.query(sql, color_data, (err, rows, fileds) => {
      conn.release();
      if (err) throw err;
    });
  })
  res.redirect('/admin/product/3');
  res.end();
  // //接到views/admin/product_2.handlebars
  // res.render('admin/product_3');
});

router.get('/3', (req, res) => {
  pool.getConnection((err, conn) => {
    if (err) throw err;
    const sql = "SELECT * FROM products";
    conn.query(sql, (err, rows, fields) => {
      conn.release();
      if (err) throw err;
      res.render('admin/product_3', {
        title: 'Admin Product page -3',
        productName: rows
      });
    });
  })
})

router.post('/admin_product_add_3', (req, res) => {
  const variants_data = {
    color_code: req.body.code,
    size: req.body.itemSize,
    stock: req.body.stock,
    products_id: req.body.itemName
  }
  pool.getConnection((err, conn) => {
    if (err) throw err;
    const sql = "INSERT INTO variants SET ?";
    conn.query(sql, variants_data, (err, rows, fileds) => {
      conn.release();
      if (err) throw err;
    });
  })
  res.redirect('/admin/product/4');
  res.end();
  // //接到views/admin/product_2.handlebars
  // res.render('admin/product_3');
});

router.get('/4', (req, res) => {
  pool.getConnection((err, conn) => {
    if (err) throw err;
    const sql = "SELECT * FROM products";
    conn.query(sql, (err, rows, fields) => {
      conn.release();
      if (err) throw err;
      res.render('admin/product_4', {
        title: 'Admin Product page -4',
        productName: rows
      });
    });
  })
})

router.post('/admin_product_add_4', upload.array('file', 2), (req, res) => {
  let times = Date.parse(new Date());
  const image_data = {
    url: times + req.files[0].originalname,
    url2: times + req.files[1].originalname,
    products_id: req.body.itemName
  }
  douploads(req, res);
  pool.getConnection((err, conn) => {
    const sql = "INSERT INTO img SET ?";
    conn.query(sql, image_data, (err, rows, fields) => {
      conn.release();
      if (err) throw err;
      res.redirect('./manage');
    });
  })
});

module.exports = router;