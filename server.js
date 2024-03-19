// 如何開啟 web 伺服器

// 引入 uuid
const { v4: uuidv4 } = require('uuid');

const errHandle = require('./errorHandle');

// 引入模組
const http = require('http')

const todos = [];

const requestListener = (req, res) => {

  // 夾帶 headers
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }

  let body = '';

  // 開始累加
  req.on('data', (chunk) => {
    body += chunk; // 封包
  })



  // console.log(req.url); // 使用者的詳細資訊
  // console.log(req.method); // 使用者的請求方法


  // 判斷路徑是否為首頁
  if (req.url == '/todos' && req.method == 'GET') {
    // 接收到 req，依照你的資料回傳內容
    res.writeHead(200, headers); // 撰寫表頭、格式
    // 把 JSON 格式轉為字串
    res.write(JSON.stringify({
      'status': 'success',
      'data': todos,
    }));
    res.end(); // 結束
  } else if (req.url == '/todos' && req.method == 'POST') {
    // chunk 累加完觸發要回傳的資料
    req.on('end', () => {
      // 成功
      try {
        const title = JSON.parse(body).title;

        // 前提是title不等於undefined時
        if (title !== undefined) {
          const todo = {
            'title': title,
            'id': uuidv4(),
          }
          todos.push(todo)
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            'status': 'success',
            'data': todos,
          }));
          res.end();
        } else {
          errHandle(res);
        }


      } catch (error) {
        errHandle(res);
      }
    })

  } else if (req.url == '/todos' && req.method == 'DELETE') {

    todos.length = 0; // 刪除的寫法，可以用 length = 0 ，直接清空

    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': 'success',
      'data': todos,
      'delete': true,
    }));
    res.end();
  } else if (req.url.startsWith('/todos/') && req.method == 'DELETE') {

    // 拆出斜線的資料，抓最後一筆資訊
    const id = req.url.split('/').pop();

    // 比對 id
    const index = todos.findIndex(element => element.id === id);

    console.log(id, index);

    if (index !== -1) {
      todos.splice(index, 1)
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        'status': 'success',
        'data': todos,
        'delete': true,
      }));
      res.end();
    } else {
      errHandle(res);
    }


  } else if (req.url.startsWith('/todos/') && req.method == 'PATCH') {
    req.on('end', () => {
      // 成功
      try {
        const todo = JSON.parse(body).title;
        const id = req.url.split('/').pop();
        const index = todos.findIndex(element => element.id === id)
        if (todo !== undefined && index !== -1) {
          todos[index].title = todo;
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            'status': 'success',
            'data': todos,
          }));
          res.end();
        } else {
          errHandle(res);
        }
        res.end();
      } catch (error) {
        errHandle(res);
      }
    })

  } else if (req.method == "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    // 建立 404
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      'status': 'false',
      'message': '無此網站路由',
    }));
    res.end();
  }

}

// 建立 server，帶一個函式並監聽
const server = http.createServer(requestListener)

// 監聽 port 3005
server.listen(process.env.PORT || 3005);

// 終端機輸入 node server.js 或是 nodemon server.js
// 開啟網頁 http://127.0.0.1:3005/todos
// 重整網頁可以看到請求 req  