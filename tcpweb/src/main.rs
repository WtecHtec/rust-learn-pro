

use std::{net::TcpListener, thread};

use tcpweb::single::handle_connection;

fn main() {
    // 开始监听服务端口 7878
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();
        thread::spawn(|| {
            handle_connection(stream);
        });
        println!("Connection established!");
    }
    println!("Hello, world!");
}
