
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