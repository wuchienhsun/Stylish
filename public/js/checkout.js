

   function fe(id){
    // let url = "http://localhost:3000/api/1.0/products/details?id="+id;
   let url = "https://www.wuhsun.com/api/1.0/products/details?id="+id;
   fetch(url, {method:'GET'})
     .then((response) => { return response.json(); })
     .then((resp)=> {create(resp);})
     .catch((err) => {console.log('error', err); })
}

function create(data){
    let detail = data.data;

    let product_info_img = document.getElementById('product_info_img');
    product_info_img.src = detail.main_image;
    let product_info_title = document.getElementById('product_info_title');
    product_info_title.textContent = detail.title;
    let product_info_id = document.getElementById('product_info_id');
    product_info_id.textContent = detail.id;
    let product_info_color = document.getElementById('product_info_color');
    product_info_color.textContent = detail.color[0].name;
    let product_info_size = document.getElementById('product_info_size');
    product_info_size.textContent = detail.size[0];
    let product_price_span = document.getElementById('product_price_span');
    product_price_span.textContent = detail.price;
    let product_total_span = document.getElementById('product_total_span');
    product_total_span.textContent = detail.price;
    let checkout_body_div_detail_span = document.getElementById('checkout_body_div_detail_span');
    checkout_body_div_detail_span.textContent = detail.price;
    let checkout_body_div_detail_span_2 = document.getElementById('checkout_body_div_detail_span_2');
    checkout_body_div_detail_span_2.textContent = detail.price;
}

let num = document.cookie.indexOf("stylish");

const id = document.cookie.substr(num+7,2);
   fe(id);