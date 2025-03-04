
use std::{fs, io::{BufRead as _, BufReader, Write as _}, net::TcpStream, time::Duration};
pub fn handle_connection(mut  stream: TcpStream) {
    // 解析buffer. 获取请求的数据
    let buf_reader = BufReader::new(&mut stream);
    // 读取请求行
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    let request_line =  if http_request.len( ) > 0 { &http_request[0] } else {""};
    
    let (status_line, filename) =  match &request_line[..] {
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", "index.html"),
        "GET /sleep HTTP/1.1" => {
            std::thread::sleep(Duration::from_secs(5)); // 添加 5 s 延迟
            ("HTTP/1.1 200 OK", "index.html")
        }
        _ => ("HTTP/1.1 404 NOT FOUND", "404.html"),
    };
    
    dbg!(filename);
    // 设置返回内容
    
    let contens = fs::read_to_string(filename).unwrap();

    let content_length = contens.len();

    // 组合返回数据
    let response = format!(
        "{}\r\nContent-Length: {}\r\n\r\n{}",
        status_line,
        content_length,
        contens
    );

    stream.write_all(response.as_bytes()).unwrap();
}   