


#[cfg(test)]
mod tests {
    use minigrep::fileutils::*;


    #[test]
    fn one_result() {
        let query = "Rust";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["Rust:"], search(query, contents));
    }
}