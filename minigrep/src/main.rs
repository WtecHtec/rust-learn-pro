
use  std::env;
use std::process;
use  std::fs;

use minigrep::config::Config;
use minigrep::fileutils::search;




fn main() {
    let args: Vec<String> = env::args().collect();
    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });
    println!("Config: {:#?}", config);
    let contents = fs::read_to_string(config.file_path).expect("Should have been able to read the file");
    let results = search(&config.query, &contents);
    dbg!(results);
}




