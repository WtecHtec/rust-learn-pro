
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




