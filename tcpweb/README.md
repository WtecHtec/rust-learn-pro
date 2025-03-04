# 基于TCP实现Web服务
# 知识点
1. tcp 服务
2. 多线程处理

# 实现功能
启动web服务，访问链接获取页面内容。
# 单线程web服务
## TcpListener
使用 TcpListener 开启服务端口
```
 let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
```
处理客户端连接：
```
 for stream in listener.incoming() {
        println!("Connection established!");
    }
```

当浏览器访问 http://127.0.0.1:7878/ 就打印  “Connection established!”, 表示服务启动成功。

## 处理接口请求
设计2个接口：
1. 访问 http://127.0.0.1:7878 时，显示index.html 的内容
2. 访问  http://127.0.0.1:7878/sleep 时，做一个延迟，模拟单线程服务的问题
## 准备html文件
1. index.html
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello!</title>
  </head>
  <body>
    <h1>Hello!</h1>
    <p>Hi from Rust</p>
  </body>
</html>
```
2. 404.html
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>你好!</title>
  </head>
  <body>
    <h1>很抱歉!</h1>
    <p>由于运维删库跑路，我们的数据全部丢失，总监也已经准备跑路，88</p>
  </body>
</html>
```
## 实现
1. 实现请求路由判断
2. 读取 html 文件内容，并且返回
## 请求路由判断
通过  BufReader 获取请求数据
```
   // 解析buffer. 获取请求的数据
    let buf_reader = BufReader::new(&mut stream);
    // 读取请求行
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();
        
```
http_requset 得到数据如下：
```
[
    "GET / HTTP/1.1",
    "Host: 127.0.0.1:7878",
    "Connection: keep-alive",
    ...
   ]
```
由此数据可得，只需要判断数组第一个数据就知道请求到哪个路由了。
```
 let request_line =  if http_request.len( ) > 0 { &http_request[0] } else {""};
    let (status_line, filename) =  match &request_line[..] {
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", "index.html"),
        "GET /sleep HTTP/1.1" => {
            std::thread::sleep(Duration::from_secs(5)); // 添加 5 s 延迟
            ("HTTP/1.1 200 OK", "index.html")
        }
        _ => ("HTTP/1.1 404 NOT FOUND", "404.html"),
    };
```

## 处理html文件
通过 文件 处理模块  fs 获取文件的内容。
```
    let contens = fs::read_to_string(filename).unwrap();
```
## 设置返回数据
获取文件的内容之后，把数据返回给客户端, 通过 **write_all** 方法。
```
 let content_length = contens.len();

    // 组合返回数据
    let response = format!(
        "{}\r\nContent-Length: {}\r\n\r\n{}",
        status_line,
        content_length,
        contens
    );

    stream.write_all(response.as_bytes()).unwrap();
```
## 效果
当客户端访问 http://127.0.0.1:7878 就会看到 index.html 的内容。如果客户端先访问 http://127.0.0.1:7878/sleep 新起标签页面访问 http://127.0.0.1:7878，如下图。你会发现 http://127.0.0.1:7878 的请求并没有立即显示，而是等待 sleep 请求结束才会显示。相当于接口会存在排队的处理，这对于web服务是个不好的体验。因此需要多线程去处理这些问题。
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/372b8fc8acd54e2eb368a8b9c2f10e4b.gif)

## 处理多线程请求
将每个请求都用 thread 去处理
```
thread::spawn(|| {
            handle_connection(stream);
        });
```
效果如下，并没有发生排队的问题。这只是简单处理，实际上现在成熟的框架处理单线程的问题。
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/9ef8473736ed4915b8c38e62e4d8892f.gif)
