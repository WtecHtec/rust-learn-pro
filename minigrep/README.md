# minigrep
根据关键字搜索文件中的内容


# 知识点
1. 结构体声明和方法
2. 模块化
3. 文件处理
4. 测试模块
5. 异常处理

# 功能
通过命令行的形式触发，根据用户提供的关键字在文本检索。执行命令如下：
```
cargo run -- keyword  filepath
```
## 实现细节拆分
1. 获取执行参数
2. 读取文本内容
3. 检索关键字

# 实现
## 创建项目
```
cargo new minigrep
```
## 实现参数处理
在src 目录下新建 config.rs 文件
```
pub struct Config {
    pub query: String,
    pub file_path: String,
}

// 构建参数
impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }
        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}

```
结构体 Config 代表应用程序的配置信息，它有两个字段：
	•	query: 要搜索的关键字 (String)
	•	file_path: 要搜索的文件路径 (String)
	•	pub 关键字 表示这两个字段可以在模块外部访问。
关联函数（静态方法） build, 它用于 从命令行参数解析 Config 配置。
args: &[String]：
	•	传入一个 字符串切片，通常是 std::env::args().collect::<Vec<String>>() 生成的。
	•	args[0] 是程序本身的名称，因此 args[1] 是搜索关键字，args[2] 是文件路径。
**异常处理 Result<Config, &'static str>：**
	•	成功 时返回 Config 结构体 (Ok(Config { ... }))。
	•	失败 时返回 Err("not enough arguments")。

## 实现文本处理
在src 目录下创建 fileutil.rs 文件
```
use std::fs;
pub fn read_file_by_path(file_path: &str) -> Box<str> {
    let contents = fs::read_to_string(file_path).expect("Should have been able to read the file");
    contents.into()
}

pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut result = Vec::new();
    for line in contents.lines()  {
        if line.contains(query) {
            result.push(line);
        }
    }
    result
}
```
read_file_by_path 函数主要作用读取文件路径 file_path 并且返回文件内容。
**为什么返回 Box<str> 而不是 String?**
	•	String 是 可变的，而 Box<str> 是 不可变的堆分配字符串，节省内存。
	•	Box<str> 比 String 更轻量，适用于 只读 场景
search 函数主要是检索关键字，返回数组结果。
**&'a str**  ——  要搜索的文本（生命周期 'a 确保返回的字符串引用有效）。
**Vec**  ——  声明一个数组
**注意**
在rust 函数中 **最后一行如果是一个结果变量没有冒号(;)意味着这个变量作为返回值**

## 导出模块
在 src 创建 lib.rs 文件
```
pub mod config; 
pub  mod  fileutils;
```

还有另外一种方式，直接在文件中引用：
```
mod config;
use config::Config;
```
## 最终代码
做好各种数据处理，按照实现拆分，现在完成最后一步，在main.rs添加最终代码。
```
use  std::env;
use std::process;
use minigrep::config::Config;
use minigrep::fileutils::read_file_by_path;
use minigrep::fileutils::search;
fn main() {
    let args: Vec<String> = env::args().collect();
    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });
    println!("Config: {:#?}", config);
    let contents = read_file_by_path(&config.file_path);
    let results = search(&config.query, &contents);
    dbg!(results);
}
```

**unwrap_or_else(|err| {...})** 处理Result 错误逻辑
[源码](https://github.com/WtecHtec/rust-learn-pro)