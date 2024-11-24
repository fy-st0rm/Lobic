# To run for the first time:
* Install diesel_cli
    ```bash
    $ cargo install diesel_cli --no-default-features --features sqlite
    ```
* Run the following command
    ```bash
    $ diesel setup
    $ diesel migration run
    ```

This will setup the database for the first run.
Now to simply run the backend:
```bash
$ cargo run
```

