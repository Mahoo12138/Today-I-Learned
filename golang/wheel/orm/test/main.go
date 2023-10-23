package main

import (
	"fmt"
	"mahoo12138/wheel/orm"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	engine, err := orm.NewEngine("sqlite3", "gee.db")
	defer engine.Close()
	if err != nil {
		fmt.Printf("Error: %s", err)
	}
	s := engine.NewSession()
	_, _ = s.Raw("DROP TABLE IF EXISTS User;").Exec()
	_, _ = s.Raw("CREATE TABLE User(Name text);").Exec()
	_, _ = s.Raw("CREATE TABLE User(Name text);").Exec()
	result, _ := s.Raw("INSERT INTO User(`Name`) values (?), (?)", "Tom", "Sam").Exec()
	count, _ := result.RowsAffected()
	fmt.Printf("Exec success, %d affected\n", count)
}
