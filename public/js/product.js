let url = window.location.href;


if (url.indexOf('?') != -1) {
    var id = url.split('?')[1].substring(3);
    console.log(id);
    fe(id);
}

function fe(id) {
    // let url = "http://localhost:4000/api/1.0/products/details?id=" + id;
    let url = "https://stylish.wuhsun.com/api/1.0/products/details?id=" + id;

    fetch(url, { method: 'GET' })
        .then((response) => { return response.json(); })
        .then((jsonData) => { generateDetails(jsonData); })
        .catch((err) => { console.log('error', err); })
}

function fe_cookie(id) {
    // let url = "http://localhost:4000/api/1.0/products/details?id=" + id;
    let url = "https://stylish.wuhsun.com/api/1.0/products/details?id=" + id;

    fetch(url, { method: 'GET' })
        .then((response) => { return response.json(); })
        .then((jsondata) => { put_cook(jsondata); })
        .catch((err) => { console.log('error', err); })
}

function generateDetails(data) {
    let detail = data.data;

    let product_main_img = document.getElementById('product_main_img');
    product_main_img.src = detail.main_image;

    let product_name_span = document.getElementById('product_name_span');
    product_name_span.textContent = detail.title;

    let product_id_span = document.getElementById('product_id_span');
    product_id_span.textContent = detail.id;

    let product_price_span = document.getElementById('product_price_span');
    product_price_span.textContent = detail.price;

    let product_color_place_div = document.getElementById('product_color_place_div');
    for (let i = 0; i < detail.color.length; i++) {
        let color_div = document.createElement('div');
        product_color_place_div.appendChild(color_div);
        // let html = `
        // <div class="color_place_div">${detail.color[0].code}</div>
        // `;
        // color_div.innerHTML = html;
        color_div.className = "color_place_div";
        color_div.style.backgroundColor = detail.color[i].code;
    }

    let product_size_place_div = document.getElementById('product_size_place_div');
    for (let i = 0; i < detail.size.length; i++) {
        let size_div = document.createElement('div');
        product_size_place_div.appendChild(size_div);
        // let html = `
        // <div class="color_place_div">${detail.color[0].code}</div>
        // `;
        // color_div.innerHTML = html;
        size_div.className = "size_place_div";
        size_div.textContent = detail.size[i].toUpperCase();
    }

    let product_note_span = document.getElementById('product_note_span');
    product_note_span.textContent = detail.note;
    let product_texture_span = document.getElementById('product_texture_span');
    product_texture_span.textContent = detail.texture;

    let product_description_span = document.getElementById('product_description_span');
    product_description_span.textContent = detail.description;

    let product_place_span = document.getElementById('product_place_span');
    product_place_span.textContent = detail.place;


    let img_1 = document.getElementById('img_1');
    let img_2 = document.getElementById('img_2');
    for (let i = 0; i < detail.images.length - 1; i++) {


        img_1.src = detail.images[i];
        img_2.src = detail.images[i + 1];

        // let html = `
        // <div class="color_place_div">${detail.color[0].code}</div>
        // `;
        // color_div.innerHTML = html;
    }
    let text = detail.story;
    let more_detail_span = document.getElementById('more_detail_span');
    more_detail_span.textContent = text;


}



let add_cart = document.getElementById('add_cart');
add_cart.addEventListener('click', (event) => {

    let url = window.location.href;
    if (url.indexOf('?') != -1) {
        var id = url.split('?')[1].substring(3);
        fe_cookie(id);
    }

})

function put_cook(data) {
    let details = data.data;
    let name = "stylish" + details.id;
    setCookie(name, JSON.stringify(details), 1);
}

function setCookie(pname, pvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = pname + "=" + pvalue + "; " + expires;
    alert("加入購物車成功成功。");
}