// let url = "http://localhost:4000/api/1.0/products/all";
let url = "https://stylish.wuhsun.com/api/1.0/products/all";

function fe(url, callback) {
    fetch(url, { method: 'GET' })
        .then((response) => { return response.json(); })
        .then((jsonData) => { generateImage_1(jsonData); })
        .catch((err) => { console.log('錯誤:', err); })
}
// let url_2 = "http://localhost:4000/api/1.0/marketing/campaigns";
let url_2 = "https://stylish.wuhsun.com/api/1.0/marketing/campaigns";

function fe_2(url_2, callback) {
    fetch(url_2, { method: 'GET' })
        .then((response) => { return response.json(); })
        .then((jsonData) => { generateImage(jsonData); })
        .catch((err) => { console.log('錯誤:', err); })
}

function generateImage(data) {
    let c_pic_div = document.getElementById('c_img_pla');
    let c_pic = data.data;
    let url = c_pic[0].picture;
    let text = c_pic[0].story;
    console.log(text.length);
    let html = `
<div>
<div>${text.substr(0, 3)}</div>
<div>${text.substr(3, 6)}</div>
<div>${text.substr(10, 10)}</div>
<div>${text.substr(20, 11)}</div>
</div>
<img src="${url}"></img>
`;
    c_pic_div.innerHTML = html;

}

// const localurl = "http://localhost:4000/product.html?id="
const localurl = "https://stylish.wuhsun.com/product.html?id="

function generateImage_1(data) {
    let pic_div = document.getElementById('product-body');

    let product_data = data.data;
    console.log(product_data);
    for (let i = 0; i < product_data.length; i++) {
        var pic_place = document.createElement('div');
        pic_place.id = 'p-item';
        pic_div.appendChild(pic_place);

        let html = `
            <a href="${localurl}` + `${product_data[i].id}"><img src='${product_data[i].main_image}' alt></a>
            <div>            
            <div id="product_code_plc_${i}" style="display:flex;"></div>
            <span>${product_data[i].title}</span> </br>
            <span>${product_data[i].price}</span>
            </div>`;
        pic_place.innerHTML = html;
        for (let c = 0; c < product_data[i].color.length; c++) {
            let product_code_plc = document.getElementById('product_code_plc_' + i);
            let code_div = document.createElement('div');
            code_div.style.backgroundColor = product_data[i].color[c].code;
            product_code_plc.appendChild(code_div);
        }
    }
}



fe(url);

fe_2(url_2);



