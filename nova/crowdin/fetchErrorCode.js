// 同步后端error code, 这里不写入script里面了, 在浏览器端执行一下拿到最新的error code做替换
async function fetchErrorCode() {
    fetch('https://testtradeapi.exchange2currency.com/api/user/global/error/list')
    .then((response) => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json(); // 解析为 JSON
    })
    .then((data) => {
        const errorCodes = data.data.reduce((acc, item) => {
        acc[item.code] = item.message;
        return acc;
        }, {});
        console.log(errorCodes);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

fetchErrorCode();